import hashlib
import io

import boto3
import pytest
from botocore.exceptions import ClientError
from moto import mock_aws

from .. import resume
from ..resume import (
    RESUME_INDEX,
    download_resume_pdf,
    extract_text_from_pdf,
    get_resume_embedding,
    process_resume,
    upsert_resume_embedding,
    resume_text_hash,
)
from ..queries import GET_RESUME_EMBEDDING, UPSERT_RESUME_EMBEDDING


def build_minimal_pdf(text="Hello, resume!"):
    """
    Build a minimal, valid single-page PDF whose page contains ``text``.
    The xref offsets are computed so the file is structurally correct.
    """
    objects = [
        b"<< /Type /Catalog /Pages 2 0 R >>",
        b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        (
            b"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] "
            b"/Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>"
        ),
    ]
    stream = f"BT /F1 16 Tf 72 700 Td ({text}) Tj ET".encode("utf-8")
    objects.append(b"<< /Length " + str(len(stream)).encode() + b" >>\nstream\n" + stream + b"\nendstream")
    objects.append(b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")

    out = io.BytesIO()
    out.write(b"%PDF-1.4\n")
    offsets = []
    for i, obj in enumerate(objects, start=1):
        offsets.append(out.tell())
        out.write(f"{i} 0 obj\n".encode())
        out.write(obj)
        out.write(b"\nendobj\n")

    xref_pos = out.tell()
    out.write(f"xref\n0 {len(objects) + 1}\n".encode())
    out.write(b"0000000000 65535 f \n")
    for offset in offsets:
        out.write(f"{offset:010d} 00000 n \n".encode())
    out.write(
        f"trailer\n<< /Size {len(objects) + 1} /Root 1 0 R >>\nstartxref\n{xref_pos}\n%%EOF\n".encode()
    )
    return out.getvalue()


@pytest.fixture
def mock_s3():
    with mock_aws():
        client = boto3.client("s3", region_name="us-east-1")
        client.create_bucket(Bucket="test-bucket")
        yield client


def test_download_resume_pdf(mock_s3):
    payload = build_minimal_pdf()
    mock_s3.put_object(Bucket="test-bucket", Key="resume_joe@example.com.pdf", Body=payload)
    result = download_resume_pdf(mock_s3, "test-bucket", "resume_joe@example.com.pdf")
    assert result == payload


def test_download_resume_pdf_missing_key(mock_s3):
    with pytest.raises(Exception):
        download_resume_pdf(mock_s3, "test-bucket", "resume_none@example.com.pdf")


def test_extract_text_from_pdf_happy():
    pdf_bytes = build_minimal_pdf("Hello, resume!")
    assert extract_text_from_pdf(pdf_bytes) == "Hello, resume!"


def test_extract_text_from_pdf_multiple_lines():
    pdf_bytes = build_minimal_pdf("Line one\nLine two")
    assert extract_text_from_pdf(pdf_bytes) == "Line one\nLine two"


def test_extract_text_from_pdf_corrupt():
    with pytest.raises(Exception):
        extract_text_from_pdf(b"this is not a pdf")


def test_resume_text_hash():
    text = "My resume text"
    assert resume_text_hash(text) == hashlib.sha256(text.encode("utf-8")).hexdigest()
    assert resume_text_hash("a") != resume_text_hash("b")


class FakeCursor:
    def __init__(self, row=None):
        self.executed = []
        self.row = row

    def execute(self, query, params):
        self.executed.append((query, params))

    def fetchone(self):
        return self.row

    def __enter__(self):
        return self

    def __exit__(self, *args):
        return False


def test_upsert_resume_embedding_with_embedding():
    cur = FakeCursor()
    text = "Hello, resume!"
    model = "amazon.titan-embed-text-v2:0"
    embedding = [1.0] + [0.0] * 1023
    upsert_resume_embedding(cur, "bob@example.com", text, model, embedding)

    assert len(cur.executed) == 1
    query, params = cur.executed[0]
    assert query == UPSERT_RESUME_EMBEDDING
    _assert_upsert_includes_embedding_and_model(query)
    assert params == [
        "bob@example.com",
        RESUME_INDEX,
        text,
        model,
        embedding,
        hashlib.sha256(text.encode("utf-8")).hexdigest(),
    ]


def test_upsert_resume_embedding_without_embedding():
    cur = FakeCursor()
    text = "Hello, resume!"
    upsert_resume_embedding(cur, "carol@example.com", text, None, None)

    assert len(cur.executed) == 1
    query, params = cur.executed[0]
    assert query == UPSERT_RESUME_EMBEDDING
    _assert_upsert_includes_embedding_and_model(query)
    assert params == [
        "carol@example.com",
        RESUME_INDEX,
        text,
        None,
        None,
        hashlib.sha256(text.encode("utf-8")).hexdigest(),
    ]


def _assert_upsert_includes_embedding_and_model(query):
    normalized = " ".join(query.split())
    insert_part = normalized.split("VALUES", 1)[0]

    assert "model" in insert_part
    assert "embedding" in insert_part
    assert "model = EXCLUDED.model" in normalized
    assert "embedding = EXCLUDED.embedding" in normalized


def test_get_resume_embedding():
    row = ("somehash", "amazon.titan-embed-text-v2:0", [0.5, 0.5])
    cur = FakeCursor(row=row)

    assert get_resume_embedding(cur, "dave@example.com") == row
    assert cur.executed == [(GET_RESUME_EMBEDDING, ["dave@example.com", RESUME_INDEX])]


def test_get_resume_embedding_missing_row():
    assert get_resume_embedding(FakeCursor(), "nobody@example.com") is None


MODEL = "amazon.titan-embed-text-v2:0"
NEW_EMBEDDING = [0.1, 0.2, 0.3]


class FakeDbConnection:
    def __init__(self, row):
        self._cursor = FakeCursor(row=row)

    def cursor(self):
        return self._cursor

    def __enter__(self):
        return self

    def __exit__(self, *args):
        return False


@pytest.fixture
def stub_resume_deps(monkeypatch):
    """
    Stub process_resume's dependencies. Tests set ``download_error`` (an
    exception for the S3 download to raise), ``text`` (the parsed text, or an
    exception for parsing to raise), ``existing_row`` (the stored embedding row), and
    ``embed_error`` (an exception for the embedding call to raise).
    Records embedding calls in ``embed_calls``.
    """
    state = {"text": "Hello, resume!", "download_error": None, "existing_row": None, "embed_error": None, "embed_calls": []}

    def fake_download(s3_client, bucket, key):
        if isinstance(state["download_error"], Exception):
            raise state["download_error"]
        return b"%PDF-stub"

    def fake_parse(pdf_bytes):
        if isinstance(state["text"], Exception):
            raise state["text"]
        return state["text"]

    def fake_embed(texts, client):
        state["embed_calls"].append(texts)
        if state["embed_error"]:
            raise state["embed_error"]
        return [NEW_EMBEDDING]

    monkeypatch.setattr(resume, "download_resume_pdf", fake_download)
    monkeypatch.setattr(resume, "extract_text_from_pdf", fake_parse)
    monkeypatch.setattr(
        resume, "get_db_connection", lambda config, name: FakeDbConnection(state["existing_row"])
    )
    monkeypatch.setattr(resume, "embed_texts", fake_embed)
    monkeypatch.setattr(resume, "get_lambda_client", lambda: object())
    return state


def run_process_resume():
    return process_resume(None, "test-bucket", {}, "erin@example.com", MODEL)


def test_process_resume_new_embedding(stub_resume_deps):
    assert run_process_resume() == ("Hello, resume!", MODEL, NEW_EMBEDDING, "complete")
    assert stub_resume_deps["embed_calls"] == [["Hello, resume!"]]


def test_process_resume_reuses_existing_embedding(stub_resume_deps):
    stored = [0.9, 0.8, 0.7]
    stub_resume_deps["existing_row"] = (resume_text_hash("Hello, resume!"), MODEL, stored)

    assert run_process_resume() == ("Hello, resume!", MODEL, stored, "complete")
    assert stub_resume_deps["embed_calls"] == []


def test_process_resume_reembeds_when_text_changed(stub_resume_deps):
    stub_resume_deps["existing_row"] = (resume_text_hash("Old resume"), MODEL, [0.9])

    assert run_process_resume() == ("Hello, resume!", MODEL, NEW_EMBEDDING, "complete")
    assert len(stub_resume_deps["embed_calls"]) == 1


def test_process_resume_reembeds_when_model_changed(stub_resume_deps):
    stub_resume_deps["existing_row"] = (resume_text_hash("Hello, resume!"), "old-model", [0.9])

    assert run_process_resume() == ("Hello, resume!", MODEL, NEW_EMBEDDING, "complete")
    assert len(stub_resume_deps["embed_calls"]) == 1


def test_process_resume_no_resume_uploaded(stub_resume_deps):
    stub_resume_deps["download_error"] = ClientError(
        {"Error": {"Code": "NoSuchKey", "Message": "Not Found"}}, "GetObject"
    )

    assert run_process_resume() == ("", None, None, "skipped")
    assert stub_resume_deps["embed_calls"] == []


def test_process_resume_s3_error_keeps_stored_resume(stub_resume_deps):
    stub_resume_deps["download_error"] = ClientError(
        {"Error": {"Code": "InternalError", "Message": "We encountered an internal error"}},
        "GetObject",
    )

    assert run_process_resume() == (None, None, None, "failed")
    assert stub_resume_deps["embed_calls"] == []


def test_process_resume_network_error_keeps_stored_resume(stub_resume_deps):
    stub_resume_deps["download_error"] = ConnectionError("timed out")

    assert run_process_resume() == (None, None, None, "failed")
    assert stub_resume_deps["embed_calls"] == []


def test_process_resume_unparseable_pdf_clears_stored_resume(stub_resume_deps):
    stub_resume_deps["text"] = ValueError("corrupt PDF")

    assert run_process_resume() == ("", None, None, "failed")
    assert stub_resume_deps["embed_calls"] == []


def test_process_resume_missing_pdf_in_real_s3_is_skipped(mock_s3):
    assert process_resume(mock_s3, "test-bucket", {}, "nobody@example.com", MODEL) == (
        "",
        None,
        None,
        "skipped",
    )


def test_process_resume_empty_resume(stub_resume_deps):
    stub_resume_deps["text"] = "   "

    assert run_process_resume() == ("   ", None, None, "skipped")
    assert stub_resume_deps["embed_calls"] == []


def test_process_resume_embedding_failure(stub_resume_deps):
    stub_resume_deps["embed_error"] = RuntimeError("Embedding Lambda failed")

    assert run_process_resume() == ("Hello, resume!", None, None, "failed")


def test_process_resume_db_read_failure(stub_resume_deps, monkeypatch):
    def broken_connection(config, name):
        raise RuntimeError("connection refused")

    monkeypatch.setattr(resume, "get_db_connection", broken_connection)

    assert run_process_resume() == ("Hello, resume!", None, None, "failed")
    assert stub_resume_deps["embed_calls"] == []
