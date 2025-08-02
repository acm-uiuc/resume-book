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

from util.oai import get_oai_client, oai_get_profile_json
from util.queries import DELETE_PROFILE, GET_USER_PROFILE_QUERY, INSERT_BASE_PROFILE, INSERT_DEGREES, generate_search_query
from util.postgres import get_db_connection
from util.structs import (
    DEFAULT_USER_PROFILE,
    MassDownloadResumesRequest,
    ProfileSearchRequest,
    ResumeUploadPresignedRequest,
    StudentProfileDetails,
    GenerateProfileRequest,
    convert_dict_keys_snake_to_camel,
)
from util.environ import get_run_environment
from util.s3 import create_presigned_url_for_put, create_presigned_url_from_s3_url, async_generate_presigned_urls
from util.logging import get_logger
from util.secretsmanager import get_parameter_from_sm
from psycopg.rows import dict_row
import asyncio

RUN_ENV = get_run_environment()
logger = get_logger()

extra_origins = os.environ.get("ValidCorsOrigins", "https://resumes.acm.illinois.edu").split(",")

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
s3_client = session.client('s3')
db_config = get_parameter_from_sm(secretsmanager, "infra-resume-book-db-config")
openai_client = get_oai_client(db_config['openrouter_key'])

PROFILE_TABLE_NAME = "infra-resume-book-profile-data"
S3_BUCKET = f"infra-resume-book-pdfs-{RUN_ENV if RUN_ENV != 'local' else 'dev'}"


def shared_get_profile(username):
    try:
        db_connection = get_db_connection(db_config, "resume_book_get_profile")
        with db_connection.transaction():
            with db_connection.cursor(row_factory=dict_row) as cur:
                cur.execute(GET_USER_PROFILE_QUERY, [username])
                profile_data = cur.fetchone()

        if not profile_data:
            DEFAULT_USER_PROFILE["username"] = username
            DEFAULT_USER_PROFILE["email"] = username
            return Response(
                status_code=200,
                content_type=content_types.APPLICATION_JSON,
                body=DEFAULT_USER_PROFILE,
            )
        else:
            if profile_data and 'resumepdfurl' in profile_data:
                profile_data["resumePdfUrl"] = profile_data["resumepdfurl"]
                del profile_data["resumepdfurl"]
            if 'degrees' not in profile_data or profile_data['degrees'] == [None]:
                profile_data['degrees'] = []
            for degree in profile_data['degrees']:
                degree['yearStarted'] = degree.pop('yearstarted')
                degree['yearEnded'] = degree.pop('yearended')
                degree.pop('username')
    except Exception as e:
        logger.error(traceback.format_exc())
        return Response(
            status_code=500,
            content_type=content_types.APPLICATION_JSON,
            body={"message": "Error getting profile data", "details": str(e)},
        )
    if profile_data and 'resumePdfUrl' in profile_data:
        profile_data["resumePdfUrl"] = create_presigned_url_from_s3_url(
            s3_client,
            profile_data["resumePdfUrl"]
        )
    return Response(
        status_code=200, content_type=content_types.APPLICATION_JSON, body=profile_data
    )

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
    return shared_get_profile(username)


@app.post("/api/v1/student/profile")
def student_post_profile():
    email = app.current_event.request_context.authorizer["username"]
    json_body: dict = app.current_event.json_body or {}
    if 'defaultResponse' in json_body:
        del json_body['defaultResponse']
    json_body['name'] = json_body['name'].lstrip()
    if 'email' not in json_body or json_body['email'] == '':
        json_body["email"] = email
    json_body["username"] = email
    json_body["resumePdfUrl"] = f"s3://{S3_BUCKET}/resume_{email}.pdf"
    try:
        data = json.loads(StudentProfileDetails(**json_body).model_dump_json(), parse_float=Decimal)
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
        logger.error(traceback.format_exc())
        return Response(
            status_code=500,
            content_type=content_types.APPLICATION_JSON,
            body={"message": "Error creating S3 URL", "details": str(e)},
        )
    if data["file_size"] > 3e7:  # 30 MB
        return Response(
            status_code=413,
            content_type=content_types.APPLICATION_JSON,
            body={
                "message": "Error creating S3 URL",
                "details": "Resume PDF cannot be larger than 30 MB.",
            },
        )
    presigned_url = create_presigned_url_for_put(
        s3_client=s3_client,
        bucket_name=S3_BUCKET,
        object_key=f"resume_{username}.pdf",
        file_size=data["file_size"],
    )
    return Response(
        status_code=200,
        content_type=content_types.APPLICATION_JSON,
        body={"message": "URL created", "url": presigned_url},
    )


@app.post("/api/v1/student/generate_profile")
def student_gpt():
    json_body: dict = app.current_event.json_body or {}
    try:
        username = app.current_event.request_context.authorizer["username"]
        data = GenerateProfileRequest(**json_body).model_dump()
        if len(''.join(data['roleKeywords'])) > 300:
            return Response(
                status_code=403,
                content_type=content_types.APPLICATION_JSON,
                body={"message": "Error validating profile generation payload", "details": "Role keywords are too long."}
            )
        response = oai_get_profile_json(openai_client, data['resumeText'], data['roleType'], ','.join(data['roleKeywords']))
        response['username'] = username
        if 'email' not in response or response['email'] == '':
            response['email'] = username
        url_properties = ['linkedin', 'github', 'website']
        for prop in url_properties:
            if response[prop] != "" and "http://" not in response[prop] and "https://" not in response[prop]:
                response[prop] = f"http://{response[prop]}"
        response['resumePdfUrl'] = create_presigned_url_from_s3_url(s3_client, f"s3://{S3_BUCKET}/resume_{username}.pdf")
    except pydantic.ValidationError as e:
        return Response(
            status_code=403,
            content_type=content_types.APPLICATION_JSON,
            body={"message": "Error validating profile generation payload", "details": str(e)},
        )
    except Exception as e:
        logger.error(traceback.format_exc())
        return Response(
            status_code=500,
            content_type=content_types.APPLICATION_JSON,
            body={"message": "Error performing profile generation", "details": str(e)},
        )
    # check that the response is valid
    try:
        response = json.loads(StudentProfileDetails(**response).model_dump_json(), parse_float=Decimal)
    except pydantic.ValidationError as e:
        return Response(
            status_code=403,
            content_type=content_types.APPLICATION_JSON,
            body={"message": "Error validating generated profile", "details": str(e)},
        )
    except Exception as e:
        logger.error(traceback.format_exc())
        return Response(
            status_code=500,
            content_type=content_types.APPLICATION_JSON,
            body={"message": "Error performing profile generation (post OAI call)", "details": str(e)},
        )
    return Response(
        status_code=200,
        content_type=content_types.APPLICATION_JSON,
        body=response,
    )

        

@app.get("/api/v1/recruiter/view_profile/<username>")
def recruiter_get_profile(username):
    return shared_get_profile(username)


@app.post("/api/v1/recruiter/search")
def recruiter_perform_search():
    json_body: dict = app.current_event.json_body or {}
    try:
        data = ProfileSearchRequest(**json_body).model_dump()
        search_query = generate_search_query(data['degreeOptions'], data['gpa'], data['graduationYears'], data['majors'])
        db_connection = get_db_connection(db_config, "resume_book_recruiter_search")
        with db_connection.transaction():
            with db_connection.cursor(row_factory=dict_row) as cur:
                cur.execute(search_query)
                search_result = [convert_dict_keys_snake_to_camel(x) for x in cur.fetchall()]
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
        body=search_result,
    )

@app.post("/api/v1/recruiter/mass_download")
def recruiter_mass_download():
    json_body: dict = app.current_event.json_body or {}
    urls = []
    try:
        data = MassDownloadResumesRequest(**json_body).model_dump()
        if len(urls) > 10:
            logger.info("Using asyncio loop")
            keys = [f"resume_{username}.pdf" for username in data['usernames']]
            urls = asyncio.run(async_generate_presigned_urls(S3_BUCKET, keys))
        else:
            logger.info("Using blocking loop")
            urls = [create_presigned_url_from_s3_url(s3_client, f"s3://{S3_BUCKET}/resume_{username}.pdf") for username in data['usernames'] ]
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
        body=urls,
    )
