import json
from aws_lambda_powertools.utilities.typing import LambdaContext
from sympy import true
from torch import log_
from util.server import app
from util.logging import configure_request_id, get_logger
import traceback

def lambda_handler(event: dict, context: LambdaContext) -> dict:
    request_id = event["requestContext"]["requestId"]
    ctx = event["requestContext"]
    configure_request_id(request_id)  # Configure the logger with the request ID
    logger = get_logger()
    if "queryStringParameters" in event and event["queryStringParameters"] is not None:
        full_path = f"{ctx['path']}?" + "&".join(
            [f"{key}={value}" for key, value in event["queryStringParameters"].items()]
        )
    else:
        full_path = ctx["path"]
    try:
        username = event["requestContext"]["authorizer"]["username"]
    except Exception:
        username = "public@acm.illinois.edu"
    log_string = f"REQUEST LOG - START - [{ctx['requestId']}] {ctx['identity']['sourceIp']}: {({username})} - [{ctx['requestTime']}] \"{ctx['httpMethod']} {full_path} {ctx['protocol']}\" {ctx['identity']['userAgent']}"
    print(log_string, flush=True)
    try:
        rval = app.resolve(event, context)
        status_code = rval["statusCode"]
    except Exception:
        logger.info(f"An error occured and bubbled up: {traceback.format_exc()}")
        rval = {
            "statusCode": 502,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"message": "An internal server error occurred."}),
        }
        status_code = 502
    log_string = f"REQUEST LOG - FINISH - [{ctx['requestId']} finished with status code {status_code}"
    print(log_string, flush=True)
    return rval