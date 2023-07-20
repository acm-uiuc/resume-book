from student.upload import get_upload_url
def healthzHandler(context):
    return {
        "statusCode": 200,
        "body": "UP"
    }
def notImplemented(context):
    return {
        "statusCode": 404,
        "body": "Method not implemented."
    }
def serverError(message):
    return {
        "statusCode": 500,
        "body": f"An error occurred - {message}"
    }
def getUploadUrl(context):
    rval = {}
    try:
        url: str = get_upload_url(f"resume_{context['uid']}.pdf")
        rval = {
            "statusCode": 200,
            "body": {
                "url": url
            }
        }
    except Exception as e:
        rval = serverError("Could not create S3 upload URL.")
        raise e
    return rval



find_handler = {
    "GET": {
        "/api/v1/healthz": healthzHandler,
        "/api/v1/student/getUploadURL": getUploadUrl,
        "/api/v1/recruiter/getResumeListings": notImplemented,
    }
}

def execute(method: str, path: str, context: dict) -> dict:
    try:
        func: function = find_handler[method][path]
        return func(context)
    except KeyError as e:
        print(f"ERROR: No handler found for method {method} and path {path}.")
        print(e)
        return {
            "statusCode": 404,
            "body": f"No handler found for method {method} path {path}."
        }