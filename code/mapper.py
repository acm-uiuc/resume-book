def healthzHandler():
    return {
        "statusCode": 200,
        "body": "UP"
    }
def getUploadURLHandler():
    return {
        "statusCode": 200,
        "body": "Method not implemented."
    }
find_handler = {
    "GET": {
        "/api/v1/healthz": healthzHandler,
        "/api/v1/student/getUploadURL": getUploadURLHandler
    }
}

def execute(method: str, path: str) -> None:
    try:
        func: function = find_handler[method][path]
        return func()
    except KeyError:
        print(f"No handler found for method {method} and path {path}.")
        return {
            "statusCode": 404,
            "body": f"No handler found for method {method} path {path}."
        }