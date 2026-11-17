import hashlib
import traceback
from io import BytesIO

from botocore.exceptions import ClientError
from pypdf import PdfReader

from .embeddings import embed_texts, get_lambda_client
from .logging import get_logger
from .postgres import get_db_connection
from .queries import GET_RESUME_EMBEDDING, UPSERT_RESUME_EMBEDDING

logger = get_logger()

# The number of resume "pieces" we store per user. Each piece is a row in
# resume_embeddings keyed by (username, index). For now a resume is stored as a
# single blob of extracted text, so this is always 0.
RESUME_INDEX = 0


def download_resume_pdf(s3_client, bucket, key):
    """
    Download a resume PDF from S3 and return its bytes.

    :param s3_client: A boto3 S3 client.
    :param bucket: Name of the S3 bucket containing the PDF.
    :param key: Object key of the PDF in the bucket.
    :return: The raw PDF contents as bytes.
    """
    try:
        response = s3_client.get_object(Bucket=bucket, Key=key)
        return response["Body"].read()
    except Exception:
        logger.error(traceback.format_exc())
        raise


def extract_text_from_pdf(pdf_bytes):
    """
    Extract the plain text from a PDF's bytes.

    :param pdf_bytes: Raw PDF contents as bytes.
    :return: The concatenated text of every page in the PDF.
    :raises: Any error raised while parsing the PDF (e.g. corrupt bytes).
    """
    reader = PdfReader(BytesIO(pdf_bytes))
    pages = [page.extract_text() or "" for page in reader.pages]
    return "\n".join(pages).strip()


def resume_text_hash(text):
    """
    Compute the hash of resume text used to decide when an embedding must be
    regenerated. Deterministic for a given input.

    :param text: The resume text to hash.
    :return: The hex digest of the sha256 hash of ``text``.
    """
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def upsert_resume_embedding(cursor, username, resume_text, model, embedding):
    """
    Upsert resume text, hash, model, and embedding using an open cursor.
    Replace the existing (username, index) row on conflict.
    Passing None for model or embedding clears that value.

    :param cursor: An open psycopg cursor.
    :param username: The user's email, matching student_profile_details.username.
    :param resume_text: The extracted resume text to store.
    :param model: The embedding model ID to store, or None to clear it.
    :param embedding: The generated or reused vector to store, or None to clear it.
    """
    text_hash = resume_text_hash(resume_text)
    cursor.execute(
        UPSERT_RESUME_EMBEDDING,
        [username, RESUME_INDEX, resume_text, model, embedding, text_hash],
    )


def get_resume_embedding(cursor, username):
    cursor.execute(GET_RESUME_EMBEDDING, [username, RESUME_INDEX])
    return cursor.fetchone()


def process_resume(s3_client, bucket, db_config, username, embedding_model):
    """
    Best-effort resume text extraction and embedding. Failures are logged and
    reported via the returned status instead. An existing embedding is reused
    when the resume text hash and model are unchanged.

    :param s3_client: A boto3 S3 client.
    :param bucket: Name of the S3 bucket containing the PDF.
    :param db_config: Database config used to read any existing embedding.
    :param username: The user's email.
    :param embedding_model: The embedding model ID to use or match.
    :return: (resume_text, model, embedding, status), where status is one of
        "complete", "skipped", or "failed". resume_text is None when the PDF
        could not be downloaded.
    """
    try:
        pdf_bytes = download_resume_pdf(s3_client, bucket, f"resume_{username}.pdf")
    except ClientError as e:
        if e.response.get("Error", {}).get("Code") == "NoSuchKey":
            return "", None, None, "skipped"
        return None, None, None, "failed"
    except Exception:
        return None, None, None, "failed"

    try:
        resume_text = extract_text_from_pdf(pdf_bytes)
    except Exception:
        logger.error(traceback.format_exc())
        return "", None, None, "failed"

    if not resume_text.strip():
        return resume_text, None, None, "skipped"

    try:
        new_hash = resume_text_hash(resume_text)
        with get_db_connection(db_config, "resume_book_read_embedding") as read_connection:
            with read_connection.cursor() as cur:
                existing = get_resume_embedding(cur, username)
        if (
            existing is not None
            and existing[0] == new_hash
            and existing[1] == embedding_model
            and existing[2] is not None
        ):
            return resume_text, existing[1], existing[2], "complete"
        embedding = embed_texts([resume_text], get_lambda_client())[0]
        return resume_text, embedding_model, embedding, "complete"
    except Exception:
        logger.error(traceback.format_exc())
        return resume_text, None, None, "failed"
