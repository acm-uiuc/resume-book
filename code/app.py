import json
from aws_lambda_powertools.utilities.typing import LambdaContext
from util.server import app
from util.logging import configure_request_id
import traceback

def lambda_handler(event: dict, context: LambdaContext) -> dict:
    request_id = event["requestContext"]["requestId"]
    ctx = event["requestContext"]
    configure_request_id(request_id)  # Configure the logger with the request ID
    if "queryStringParameters" in event and event["queryStringParameters"] is not None:
        full_path = f"{ctx['path']}?" + "&".join(
            [f"{key}={value}" for key, value in event["queryStringParameters"].items()]
        )
    else:
        full_path = ctx["path"]
    try:
        rval = app.resolve(event, context)
        status_code = rval["statusCode"]
    except Exception:
        print("An error occured and bubbled up: ", traceback.format_exc(), flush=True)
        rval = {
            "statusCode": 502,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"message": "An internal server error occurred."}),
        }
        status_code = 502
    log_string = f"[{ctx['requestId']}] REQUEST FROM {ctx['identity']['sourceIp']} - [{ctx['requestTime']}] \"{ctx['httpMethod']} {full_path} {ctx['protocol']}\" {status_code} {ctx['identity']['userAgent']}"
    print(log_string, flush=True)
    return rval