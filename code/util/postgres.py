import psycopg

def get_db_connection(db: dict, application_name: str = "unknown_application"):
    conn = psycopg.connect(
        dbname=db['database'],
        user=db['username'],
        password=db['password'],
        host=db['host'],
        port=db['port'],
        autocommit=True,
        application_name=application_name
    )
    return conn