import hashlib
import traceback
from io import BytesIO

from pypdf import PdfReader

from util.logging import get_logger

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


def extract_resume_text(s3_client, bucket, username):
    """
    Download and extract the text of a user's resume PDF from S3.

    :param s3_client: A boto3 S3 client.
    :param bucket: Name of the S3 bucket containing the PDF.
    :param username: The user's email, used to build the object key.
    :return: The extracted resume text.
    """
    key = f"resume_{username}.pdf"
    pdf_bytes = download_resume_pdf(s3_client, bucket, key)
    return extract_text_from_pdf(pdf_bytes)


save_resume_text_query = """
INSERT INTO resume_embeddings (username, index, text, hash, updated_at)
VALUES (%s, %s, %s, %s, now())
ON CONFLICT (username, index)
DO UPDATE SET text = EXCLUDED.text,
              hash = EXCLUDED.hash,
              updated_at = now();
"""


def insert_resume_text(cursor, username, resume_text):
    """
    Upsert a user's resume text into resume_embeddings using an already-open
    cursor (e.g. within the caller's transaction).

    The embedding and model columns are intentionally left untouched for now,
    since embeddings cannot be generated yet. The (username, index) primary key
    is upserted so saving a profile multiple times overwrites the previous text
    and refreshes the hash rather than creating duplicate rows.

    :param cursor: An open psycopg cursor.
    :param username: The user's email, matching student_profile_details.username.
    :param resume_text: The extracted resume text to store.
    """
    text_hash = resume_text_hash(resume_text)
    cursor.execute(
        save_resume_text_query,
        [username, RESUME_INDEX, resume_text, text_hash],
    )


def save_resume_text(db_connection, username, resume_text):
    """
    Persist a user's resume text into resume_embeddings on a dedicated
    connection/transaction.

    :param db_connection: A psycopg connection.
    :param username: The user's email, matching student_profile_details.username.
    :param resume_text: The extracted resume text to store.
    """
    with db_connection.transaction():
        with db_connection.cursor() as cur:
            insert_resume_text(cur, username, resume_text)