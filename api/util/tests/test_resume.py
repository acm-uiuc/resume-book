import hashlib
import io

import boto3
import pytest
from moto import mock_aws

from ..resume import (
    RESUME_INDEX,
    download_resume_pdf,
    extract_resume_text,
    extract_text_from_pdf,
    insert_resume_text,
    resume_text_hash,
    save_resume_text,
    save_resume_text_query,
)


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


def test_extract_resume_text(mock_s3):
    payload = build_minimal_pdf("Alice Resume")
    mock_s3.put_object(
        Bucket="test-bucket",
        Key="resume_alice@example.com.pdf",
        Body=payload,
    )
    result = extract_resume_text(mock_s3, "test-bucket", "alice@example.com")
    assert result == "Alice Resume"


class FakeCursor:
    def __init__(self):
        self.executed = []

    def execute(self, query, params):
        self.executed.append((query, params))

    def __enter__(self):
        return self

    def __exit__(self, *args):
        return False


class FakeConnection:
    def __init__(self):
        self._cursor = FakeCursor()

    def transaction(self):
        return self

    def cursor(self):
        return self._cursor

    def __enter__(self):
        return self

    def __exit__(self, *args):
        return False


def test_save_resume_text_fills_non_null_columns():
    conn = FakeConnection()
    text = "Hello, resume!"
    save_resume_text(conn, "bob@example.com", text)

    assert len(conn._cursor.executed) == 1
    query, params = conn._cursor.executed[0]
    assert query == save_resume_text_query
    _assert_insert_omits_embedding_and_model(query)
    assert params == [
        "bob@example.com",
        RESUME_INDEX,
        text,
        hashlib.sha256(text.encode("utf-8")).hexdigest(),
    ]


def test_insert_resume_text_uses_cursor():
    cur = FakeCursor()
    text = "Hello, resume!"
    insert_resume_text(cur, "carol@example.com", text)

    assert len(cur.executed) == 1
    query, params = cur.executed[0]
    assert query == save_resume_text_query
    _assert_insert_omits_embedding_and_model(query)
    assert params == [
        "carol@example.com",
        RESUME_INDEX,
        text,
        hashlib.sha256(text.encode("utf-8")).hexdigest(),
    ]


def _assert_insert_omits_embedding_and_model(query):
    # Columns the query references
    for col in ["username", "index", "text", "hash", "updated_at"]:
        assert col in query
    # embedding / model are not touched yet (note: the table name
    # resume_embeddings itself contains the substring "embedding")
    query_without_table = query.replace("resume_embeddings", "")
    assert "embedding" not in query_without_table
    assert "model" not in query