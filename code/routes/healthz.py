from util.server import app
from aws_lambda_powertools.event_handler import Response, content_types

@app.get("/api/v1/healthz")
def healthz():
    return Response(status_code=200, content_type=content_types.APPLICATION_JSON, body={"message": "UP"})