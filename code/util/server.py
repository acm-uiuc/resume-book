import traceback
from aws_lambda_powertools.event_handler import (
    APIGatewayRestResolver,
    CORSConfig,
    Response,
    content_types,
)
import pydantic
import boto3
import os
import json
from decimal import Decimal

from util.queries import DELETE_PROFILE, GET_USER_PROFILE_QUERY, INSERT_BASE_PROFILE, INSERT_DEGREES
from util.postgres import get_db_connection
from util.dynamo import (
    construct_filter_query,
    convert_from_dynamodb_json,
    unpreprocess_profile,
)
from util.structs import (
    DEFAULT_USER_PROFILE,
    ProfileSearchRequest,
    ResumeUploadPresignedRequest,
    StudentProfileDetails,
)
from util.environ import get_run_environment
from util.s3 import create_presigned_url_for_put, create_presigned_url_from_s3_url
from util.logging import get_logger
from util.secretsmanager import get_parameter_from_sm

RUN_ENV = get_run_environment()
logger = get_logger()

extra_origins = []
if RUN_ENV != "prod":
    extra_origins = ["http://localhost:5173"]

cors_config = CORSConfig(
    allow_origin="https://resumes.acm.illinois.edu",
    extra_origins=extra_origins,
    max_age=300,
    allow_credentials=True,
    allow_headers=["authorization"],
)
app = APIGatewayRestResolver(cors=cors_config)
session = boto3.Session(region_name=os.environ.get("AWS_REGION", "us-east-1"))
secretsmanager = session.client("secretsmanager")
dynamodb = session.client("dynamodb")
db_config = get_parameter_from_sm(secretsmanager, "infra-resume-book-db-config")

PROFILE_TABLE_NAME = "infra-resume-book-profile-data"
S3_BUCKET = f"infra-resume-book-pdfs-{RUN_ENV if RUN_ENV != 'local' else 'dev'}"


@app.get("/api/v1/healthz")
def healthz():
    return Response(
        status_code=200,
        content_type=content_types.APPLICATION_JSON,
        body={"message": "UP"},
    )


@app.get("/api/v1/student/profile")
def student_get_profile():
    username = app.current_event.request_context.authorizer["username"]
    try:
        db_connection = get_db_connection(db_config, "resume_book_get_profile")
        with db_connection.transaction():
            with db_connection.cursor() as cur:
                logger.info(GET_USER_PROFILE_QUERY)
                logger.info(username)
                cur.execute(GET_USER_PROFILE_QUERY, [username])
                profile_data = cur.fetchone()
                if profile_data and 'resumepdfurl' in profile_data:
                    profile_data["resumePdfUrl"] = profile_data["resumepdfurl"]
                    del profile_data["resumepdfurl"]
        if not profile_data:
            DEFAULT_USER_PROFILE["username"] = username
            DEFAULT_USER_PROFILE["email"] = username
            return Response(
                status_code=200,
                content_type=content_types.APPLICATION_JSON,
                body=DEFAULT_USER_PROFILE,
            )
    except Exception as e:
        logger.error(traceback.format_exc())
        return Response(
            status_code=500,
            content_type=content_types.APPLICATION_JSON,
            body={"message": "Error getting profile data", "details": str(e)},
        )
    if profile_data and 'resumePdfUrl' in profile_data:
        profile_data["resumePdfUrl"] = create_presigned_url_from_s3_url(
            profile_data["resumePdfUrl"]
        )
    return Response(
        status_code=200, content_type=content_types.APPLICATION_JSON, body=profile_data
    )


@app.post("/api/v1/student/profile")
def student_post_profile():
    email = app.current_event.request_context.authorizer["username"]
    json_body: dict = app.current_event.json_body or {}
    if 'defaultResponse' in json_body:
        del json_body['defaultResponse']
    json_body["email"] = email
    json_body["username"] = email
    json_body["resumePdfUrl"] = f"s3://{S3_BUCKET}/resume_{email}.pdf"
    try:
        data = json.loads(
            StudentProfileDetails(**json_body).model_dump_json(), parse_float=Decimal
        )
        db_connection = get_db_connection(db_config, "resume_book_post_profile")
        with db_connection.transaction():
            with db_connection.cursor() as cur:
                cur.execute(DELETE_PROFILE, [email])
                cur.execute(
                    INSERT_BASE_PROFILE,
                    [
                        email,
                        data["name"],
                        data["email"],
                        data["linkedin"] or "",
                        data["github"] or "",
                        data["website"] or "",
                        data["bio"] or "",
                        data["skills"],
                        data["work_auth_required"],
                        data["sponsorship_required"],
                        data["resumePdfUrl"],
                    ],
                )
                degree_payloads = []
                for item in data["degrees"]:
                    degree_payloads.append(
                        [
                            email,
                            item["level"],
                            item["yearStarted"],
                            item["yearEnded"],
                            item["institution"],
                            item["major"],
                            item["minor"],
                            item["gpa"],
                        ]
                    )
                cur.executemany(INSERT_DEGREES, degree_payloads)
                cur.fetchall()
    except pydantic.ValidationError as e:
        return Response(
            status_code=403,
            content_type=content_types.APPLICATION_JSON,
            body={"message": "Error validating payload", "details": str(e)},
        )
    except Exception as e:
        logger.error(traceback.format_exc())
        return Response(
            status_code=500,
            content_type=content_types.APPLICATION_JSON,
            body={"message": "Error storing profile data", "details": str(e)},
        )
    return Response(
        status_code=201,
        content_type=content_types.APPLICATION_JSON,
        body={"message": "Profile saved"},
    )


@app.post("/api/v1/student/resume_upload_url")
def student_get_s3_presigned():
    try:
        username = app.current_event.request_context.authorizer["username"]
        json_body: dict = app.current_event.json_body or {}
        data = json.loads(
            ResumeUploadPresignedRequest(**json_body).model_dump_json(),
            parse_float=Decimal,
        )
    except pydantic.ValidationError as e:
        return Response(
            status_code=403,
            content_type=content_types.APPLICATION_JSON,
            body={"message": "Error validating payload", "details": str(e)},
        )
    except Exception as e:
        logger.error(traceback.format_exc(), flush=True)
        return Response(
            status_code=500,
            content_type=content_types.APPLICATION_JSON,
            body={"message": "Error creating S3 URL", "details": str(e)},
        )
    if data["file_size"] > 1.5e7:  # 15 MB
        return Response(
            status_code=413,
            content_type=content_types.APPLICATION_JSON,
            body={
                "message": "Error creating S3 URL",
                "details": "Resume PDF cannot be larger than 15 MB.",
            },
        )
    presigned_url = create_presigned_url_for_put(
        bucket_name=S3_BUCKET,
        object_key=f"resume_{username}.pdf",
        file_size=data["file_size"],
    )
    return Response(
        status_code=200,
        content_type=content_types.APPLICATION_JSON,
        body={"message": "URL created", "url": presigned_url},
    )


@app.get("/api/v1/recruiter/view_profile/<username>")
def recruiter_get_profile(username):
    try:
        resp = dynamodb.get_item(
            TableName=PROFILE_TABLE_NAME, Key={"username": {"S": username}}
        )
        if "Item" in resp:
            profile_data = resp["Item"]
        else:
            return Response(
                status_code=404,
                content_type=content_types.APPLICATION_JSON,
                body={"message": f"No profile found for {username}"},
            )
    except Exception as e:
        logger.error(traceback.format_exc())
        return Response(
            status_code=500,
            content_type=content_types.APPLICATION_JSON,
            body={"message": "Error getting profile data", "details": str(e)},
        )
    # generate presigned url for resume pdf
    profile_data = convert_from_dynamodb_json(profile_data)
    profile_data["resumePdfUrl"] = create_presigned_url_from_s3_url(
        profile_data["resumePdfUrl"]
    )
    return Response(
        status_code=200, content_type=content_types.APPLICATION_JSON, body=profile_data
    )


@app.post("/api/v1/recruiter/search")
def recruiter_perform_search():
    json_body: dict = app.current_event.json_body or {}
    final_response = []
    try:
        data = json.loads(
            ProfileSearchRequest(**json_body).model_dump_json(), parse_float=Decimal
        )
        filter_query = construct_filter_query(
            data["degreeOptions"], data["gpa"], data["graduationYears"], data["majors"]
        )
        dynamodb_resource = session.resource("dynamodb")
        table = dynamodb_resource.Table(PROFILE_TABLE_NAME)
        response = table.scan(FilterExpression=filter_query)
        if "Items" in response:
            final_response = [unpreprocess_profile(x) for x in response["Items"]]
    except pydantic.ValidationError as e:
        return Response(
            status_code=403,
            content_type=content_types.APPLICATION_JSON,
            body={"message": "Error validating payload", "details": str(e)},
        )
    except Exception as e:
        logger.error(traceback.format_exc())
        return Response(
            status_code=500,
            content_type=content_types.APPLICATION_JSON,
            body={"message": "Error performing profile search", "details": str(e)},
        )
    return Response(
        status_code=200,
        content_type=content_types.APPLICATION_JSON,
        body=final_response,
    )
