from student.upload import get_upload_url
from recruiter.get import get_resume_url
from student.user import get_user, update_user, register_user
import json
import traceback


def healthzHandler(context, queryParams, body):
    return {
        "statusCode": 200,
        "body": "UP!"
    }
def notImplemented(context, queryParams, body):
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
def getUploadUrl(context, queryParams, body):
    rval = {}
    try:
        url: str = get_upload_url(f"resume_{queryParams['uid']}.pdf")
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

def getUserId(context, queryParams, body):
    return {
        "statusCode": 200,
        "body": json.dumps({
            "id": context['object_id']
        })
    }

def getResumeUrl(context, queryParams, body):
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
                "url": url,
            })
        }
    except:
        rval = serverError("Could not create S3 download URL.")
        traceback.print_exc()
    return rval
    
def getUser(context, queryParams, body):
    rval = {}
    try:
        user: str = get_user(queryParams['id'])
        rval = {
            "statusCode": 200,
            "body": json.dumps({
                "user": user
            })
        }
    except:
        rval = serverError("Could not get user.")
        traceback.print_exc()
    return rval

def updateUser(context, queryParams, body):
    rval = {}
    if body == "": 
        return
    try:
        update_user(queryParams["uid"], body)
    except:
        rval = serverError("Could not get user.")
        traceback.print_exc()
    return rval

find_handler = {
    "GET": {
        "/api/v1/healthz": healthzHandler,
        "/api/v1/student/getUploadURL": getUploadUrl,
        "/api/v1/recruiter/getResumeUrl": getResumeUrl,
        "/api/v1/recruiter/getResumeListings": notImplemented,
        "/api/v1/student": getUser,
        "/api/v1/student/id": getUserId
    },
    "POST": {
        "/api/v1/student": updateUser,
    },
}

def execute(method: str, path: str, queryParams: dict, context: dict, body: str) -> dict:
    try:
        func: function = find_handler[method][path]
        return func(context, queryParams, body)
    except KeyError as e:
        print(f"ERROR: No handler found for method {method} and path {path}.")
        return notImplemented(context, queryParams)