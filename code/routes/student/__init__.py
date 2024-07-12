from util.server import app
from aws_lambda_powertools.event_handler import Response, content_types

@app.get("/api/v1/student/profile")
def get_profile():
    return Response(status_code=200, content_type=content_types.APPLICATION_JSON, body={"message": "Profile here"})