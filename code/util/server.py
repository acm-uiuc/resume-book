
import traceback
from aws_lambda_powertools.event_handler import APIGatewayRestResolver, CORSConfig, Response, content_types
import pydantic
import boto3
import os
import json
from decimal import Decimal

from util.dynamo import convert_to_dynamodb_json, convert_from_dynamodb_json
from util.structs import ResumeUploadPresignedRequest, StudentProfileDetails
from util.environ import get_run_environment
from util.s3 import create_presigned_url_for_put, create_presigned_url_from_s3_url
from util.logging import get_logger

RUN_ENV = get_run_environment()
logger = get_logger()

extra_origins = []
if RUN_ENV != "prod":
    extra_origins = ["http://localhost:5173"]

cors_config = CORSConfig(allow_origin="https://resumes.acm.illinois.edu", extra_origins=extra_origins, max_age=300, allow_credentials=True, allow_headers=["authorization"])
app = APIGatewayRestResolver(cors=cors_config)

session = boto3.Session(region_name=os.environ.get('AWS_REGION', 'us-east-1'))
dynamodb = session.client('dynamodb')

PROFILE_TABLE_NAME = "infra-resume-book-profile-data"
S3_BUCKET = f"infra-resume-book-pdfs-{RUN_ENV}"

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
    # generate presigned url for resume pdf 
    profile_data = convert_from_dynamodb_json(profile_data)
    profile_data['resumePdfUrl'] = create_presigned_url_from_s3_url(profile_data['resumePdfUrl'])
    return Response(status_code=200, content_type=content_types.APPLICATION_JSON, body=profile_data)

@app.post("/api/v1/student/profile")
def student_post_profile():
    email = app.current_event.request_context.authorizer['username']
    json_body: dict = app.current_event.json_body or {}
    json_body['email'] = email
    json_body['username'] = email
    json_body['resumePdfUrl'] = f"s3://{S3_BUCKET}/resume_{email}.pdf"
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

@app.post("/api/v1/student/resume_upload_url")
def student_get_s3_presigned():
    if 'json_body' not in app.current_event or not app.current_event.json_body:
        return Response(status_code=403, content_type=content_types.APPLICATION_JSON, body={"message": "Error validating payload", "details": "No request body provided."})
    try:
        username = app.current_event.request_context.authorizer['username']
        json_body: dict = app.current_event.json_body
        data = json.loads(ResumeUploadPresignedRequest(**json_body).model_dump_json(), parse_float=Decimal)
    except pydantic.ValidationError as e:
        return Response(status_code=403, content_type=content_types.APPLICATION_JSON, body={"message": "Error validating payload", "details": str(e)})
    except Exception as e:
        print(traceback.format_exc(), flush=True)
        return Response(status_code=500, content_type=content_types.APPLICATION_JSON, body={"message": "Error storing profile data", "details": str(e)})
    if data['file_size'] > 1.5e7: # 15 MB
        return Response(status_code=413, content_type=content_types.APPLICATION_JSON, body={"message": "Payload too big", "details": "Resume PDF cannot be larger than 15 MB."})
    presigned_url = create_presigned_url_for_put(bucket_name=S3_BUCKET, object_key=f"resume_{username}.pdf", file_size=data['file_size'])
    return Response(status_code=200, content_type=content_types.APPLICATION_JSON, body={"message": "URL created", "url": presigned_url})

@app.get("/api/v1/recruiter/view_profile/<username>")
def recruiter_get_profile(username):
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
    # generate presigned url for resume pdf 
    profile_data = convert_from_dynamodb_json(profile_data)
    profile_data['resumePdfUrl'] = create_presigned_url_from_s3_url(profile_data['resumePdfUrl'])
    return Response(status_code=200, content_type=content_types.APPLICATION_JSON, body=profile_data)