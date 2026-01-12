import traceback
from uuid import uuid4
from aad import lambda_handler as aad_handler
from local import lambda_handler as kinde_handler
from custom import lambda_handler as custom_jwt_handler
from shared import AuthPolicy
import os 
import jwt
import logging
import uuid
instance_id = str(uuid.uuid1())

run_env = os.environ.get("RunEnvironment") # assume prod by default as it is the most restrictive environment

def lambda_handler(event, context):
    if 'action' in event and event['action'] == "warmer":
      return {"instanceId": instance_id}
    tmp = event['methodArn'].split(':')
    apiGatewayArnTmp = tmp[5].split('/')
    awsAccountId = tmp[4]
    try:
        method, token = event['authorizationToken'].split(' ')
        if method == "Bearer":
            decoded = jwt.decode(token, options={"verify_aud": False, "verify_signature": False},)
            if decoded['iss'] == 'https://sts.windows.net/c8d9148f-9a59-4db3-827d-42ea0c2b6e2e/' and decoded['appid'] == os.environ.get("AadValidClientId"):
                return aad_handler(event, context)
            elif decoded['iss'] == 'https://auth.acm.illinois.edu' and decoded['azp'] == os.environ.get("KindeValidClientId"):
                return kinde_handler(event, context)
            elif decoded['iss'] == 'custom_jwt':
                if not run_env or run_env == 'prod':
                    logging.warn(f"Attempt to use a testing JWT against the prod environment: {token}")
                    raise ValueError("invalid token issuer.")
                return custom_jwt_handler(event, context)
            else:
                raise ValueError("invalid issuer or environment token")
        principalId = token
    except Exception:
        logging.error(traceback.format_exc())
        principalId = str(uuid4())
    logging.info("Denying all")
    policy = AuthPolicy(principalId, awsAccountId)
    policy.restApiId = apiGatewayArnTmp[0]
    policy.region = tmp[3]
    policy.stage = apiGatewayArnTmp[1]
    policy.denyAllMethods()
    authResponse = policy.build()
    return authResponse

