from aws_lambda_powertools.event_handler import APIGatewayRestResolver, CORSConfig, Response, content_types
import pydantic
from util.structs import StudentProfileDetails

cors_config = CORSConfig(allow_origin="https://resumes.acm.illinois.edu", extra_origins=["http://localhost:5173"], max_age=300, allow_credentials=True, allow_headers=["authorization"])
app = APIGatewayRestResolver(cors=cors_config)

@app.get("/api/v1/healthz")
def healthz():
    return Response(status_code=200, content_type=content_types.APPLICATION_JSON, body={"message": "UP"})

@app.get("/api/v1/student/profile")
def student_ping():
    username = app.current_event.request_context.authorizer['username']
    return Response(status_code=404, content_type=content_types.APPLICATION_JSON, body={"message": f"No profile found for user {username}"})

@app.post("/api/v1/student/profile")
def student_post():
    email = app.current_event.request_context.authorizer['username']
    json_body: dict = app.current_event.json_body

    json_body['email'] = email
    json_body['username'] = email
    try:
        data = StudentProfileDetails(**json_body).model_dump()
    except pydantic.ValidationError as e:
        return Response(status_code=403, content_type=content_types.APPLICATION_JSON, body={"message": f"Error validating payload: {str(e)}"})
    return Response(status_code=201, content_type=content_types.APPLICATION_JSON, body=data)

@app.get("/api/v1/recruiter/ping")
def recruiter_ping():
    return Response(status_code=200, content_type=content_types.APPLICATION_JSON, body={"message": "Recruiter route accessible"})