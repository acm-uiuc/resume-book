from student.upload import get_upload_url
from recruiter.get import get_resume_url
import json
import traceback

def healthzHandler(context, queryParams):
    return {
        "statusCode": 200,
        "body": "UP"
    }
def notImplemented(context, queryParams):
    return {
        "statusCode": 404,
        "body": "Method not implemented."
    }
def serverError(message):
    return {
        "statusCode": 500,
        "body": f"An error occurred - {message}"
    }
def badRequest(message):
    return {
        "statusCode": 400,
        "body": f"Bad request - {message}"
    }
def getUploadUrl(context, queryParams):
    rval = {}
    try:
        url: str = get_upload_url(f"resume_{context['uid']}.pdf")
        rval = {
            "statusCode": 200,
            "body": json.dumps({
                "url": url
            })
        }
    except:
        rval = serverError("Could not create S3 upload URL.")
        traceback.print_exc()
    return rval

def getResumeUrl(context, queryParams):
    rval = {}
    if not 'uid' in queryParams:
        return badRequest("Query parameter 'uid' is missing.")
    try:
        url: str | None = get_resume_url(queryParams['uid'])
        if not url:
            return badRequest("This UID has no resume.")
        rval = {
            "statusCode": 200,
            "body": json.dumps({
                "url": url
            })
        }
    except:
        rval = serverError("Could not create S3 download URL.")
        traceback.print_exc()
    return rval

find_handler = {
    "GET": {
        "/api/v1/healthz": healthzHandler,
        "/api/v1/student/getUploadURL": getUploadUrl,
        "/api/v1/recruiter/getResumeUrl": getResumeUrl,
        "/api/v1/recruiter/getResumeListings": notImplemented,
    }
}

def execute(method: str, path: str, queryParams: dict, context: dict) -> dict:
    try:
        func: function = find_handler[method][path]
        return func(context, queryParams)
    except KeyError as e:
        print(f"ERROR: No handler found for method {method} and path {path}.")
        return notImplemented(context, queryParams)