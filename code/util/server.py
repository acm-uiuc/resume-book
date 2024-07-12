
import traceback
from aws_lambda_powertools.event_handler import APIGatewayRestResolver, CORSConfig, Response, content_types
import pydantic
import boto3
import os
from util.dynamo import convert_to_dynamodb_json, convert_from_dynamodb_json
from util.structs import StudentProfileDetails
import json
from decimal import Decimal

cors_config = CORSConfig(allow_origin="https://resumes.acm.illinois.edu", extra_origins=["http://localhost:5173"], max_age=300, allow_credentials=True, allow_headers=["authorization"])
app = APIGatewayRestResolver(cors=cors_config)

session = boto3.Session(region_name=os.environ.get('AWS_REGION', 'us-east-1'))
dynamodb = session.client('dynamodb')

PROFILE_TABLE_NAME = "infra-resume-book-profile-data"

@app.get("/api/v1/healthz")
def healthz():
    return Response(status_code=200, content_type=content_types.APPLICATION_JSON, body={"message": "UP"})

@app.get("/api/v1/student/profile")
def student_get_profile():
    username = app.current_event.request_context.authorizer['username']
    try:
        resp = dynamodb.get_item(
            TableName=PROFILE_TABLE_NAME,
            Key={
                'username': {'S': username}
            }
        )
        if 'Item' in resp:
            profile_data = resp['Item']
        else:
            return Response(status_code=404, content_type=content_types.APPLICATION_JSON, body={"message": f"No profile found for {username}"})
    except Exception as e:
        print(traceback.format_exc(), flush=True)
        return Response(status_code=500, content_type=content_types.APPLICATION_JSON, body={"message": "Error getting profile data", "details": str(e)})
    return Response(status_code=200, content_type=content_types.APPLICATION_JSON, body=convert_from_dynamodb_json(profile_data))

@app.post("/api/v1/student/profile")
def student_post_profile():
    email = app.current_event.request_context.authorizer['username']
    json_body: dict = app.current_event.json_body
    json_body['email'] = email
    json_body['username'] = email
    try:
        data = json.loads(StudentProfileDetails(**json_body).model_dump_json(), parse_float=Decimal)
        dynamo_data = convert_to_dynamodb_json(data)
        dynamodb.put_item(TableName=PROFILE_TABLE_NAME, Item=dynamo_data)
    except pydantic.ValidationError as e:
        return Response(status_code=403, content_type=content_types.APPLICATION_JSON, body={"message": "Error validating payload", "details": str(e)})
    except Exception as e:
        print(traceback.format_exc(), flush=True)
        return Response(status_code=500, content_type=content_types.APPLICATION_JSON, body={"message": "Error storing profile data", "details": str(e)})
    return Response(status_code=201, content_type=content_types.APPLICATION_JSON, body={"message": "Profile saved"})

@app.get("/api/v1/recruiter/ping")
def recruiter_ping():
    return Response(status_code=200, content_type=content_types.APPLICATION_JSON, body={"message": "Recruiter route accessible"})