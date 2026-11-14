"""Integration tests against local PostgreSQL with pgvector.

Setup:
    docker run --name resume-book-test-db \
        -e POSTGRES_USER=resume_test \
        -e POSTGRES_PASSWORD=local_test_only \
        -e POSTGRES_DB=resume_book_test \
        -p 127.0.0.1:5433:5432 \
        -d pgvector/pgvector:pg16

    docker exec resume-book-test-db \
        psql -U resume_test -d resume_book_test \
        -c "CREATE EXTENSION IF NOT EXISTS vector;"

Restart an existing container:
    docker start resume-book-test-db

Run from the repository root:
    .venv/bin/python -m pytest -q tests/local_integration/

Each test uses a temporary table. No AWS services are called.
"""

import psycopg
import pytest
from api.util.resume import upsert_resume_data, resume_text_hash

@pytest.fixture
def db_connection():
    conn = psycopg.connect(
        host="127.0.0.1",
        port=5433,
        dbname="resume_book_test",
        user="resume_test",
        password="local_test_only",
    )
    try:
        conn.execute("""
            CREATE TEMP TABLE resume_embeddings (
                username text NOT NULL,
                index integer NOT NULL DEFAULT 0,
                text text NOT NULL,
                hash text NOT NULL,
                model text,
                embedding vector(1024),
                updated_at timestamp with time zone NOT NULL DEFAULT now(),
                PRIMARY KEY (username, index)
            )
        """)
        yield conn
    finally:
        try:
            conn.rollback()
        finally:
            conn.close()

def test_insert_resume_embedding(db_connection):
    username = "student@example.com"
    text = "Python and SQL experience"
    model = "amazon.titan-embed-text-v2:0"
    embedding = [1.0] + [0.0] * 1023

    with db_connection.cursor() as cur:
        upsert_resume_data(cur, username, text, model, embedding)

        cur.execute(
            """
            SELECT text, hash, model,
                   vector_dims(embedding), embedding::real[]
            FROM resume_embeddings
            WHERE username = %s AND index = %s
            """,
            [username, 0],
        )
        row = cur.fetchone()

    assert row is not None
    assert row[0] == text
    assert row[1] == resume_text_hash(text)
    assert row[2] == model
    assert row[3] == 1024
    assert row[4] == pytest.approx(embedding)

def test_update_resume_embedding(db_connection):
    username = "student@example.com"
    text = "C++ and systems experience"
    model = "amazon.titan-embed-text-v2:0"
    embedding = [0.0, 1.0] + [0.0] * 1022

    with db_connection.cursor() as cur:
        upsert_resume_data(
            cur,
            username,
            "Python and SQL experience",
            model,
            [1.0] + [0.0] * 1023,
        )
        upsert_resume_data(cur, username, text, model, embedding)    
        cur.execute(
            """
            SELECT text, hash, model,
                    vector_dims(embedding), embedding::real[]
            FROM resume_embeddings
            WHERE username = %s AND index = %s
            """,
            [username, 0],
        )
        row = cur.fetchone()
        cur.execute(
            "SELECT count(*) FROM resume_embeddings WHERE username = %s",
            [username],
        )
        row_count = cur.fetchone()[0]

    assert row_count == 1
    assert row is not None
    assert row[0] == text
    assert row[1] == resume_text_hash(text)
    assert row[2] == model
    assert row[3] == 1024
    assert row[4] == pytest.approx(embedding)

def test_upsert_clears_previous_embedding(db_connection):
    username = "student@example.com"
    text = "C++ and systems experience"
    model = "amazon.titan-embed-text-v2:0"

    with db_connection.cursor() as cur:
        upsert_resume_data(
            cur,
            username,
            "Python and SQL experience",
            model,
            [1.0] + [0.0] * 1023,
        )
        upsert_resume_data(cur, username, text, None, None)
    
        cur.execute(
            """
            SELECT text, hash, model,
                    vector_dims(embedding), embedding::real[]
            FROM resume_embeddings
            WHERE username = %s AND index = %s
            """,
            [username, 0],
        )
        row = cur.fetchone()
        cur.execute(
            "SELECT count(*) FROM resume_embeddings WHERE username = %s",
            [username],
        )
        row_count = cur.fetchone()[0]

    assert row_count == 1
    assert row is not None
    assert row[0] == text
    assert row[1] == resume_text_hash(text)
    assert row[2] is None
    assert row[4] is None