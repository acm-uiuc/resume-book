import traceback
from uuid import uuid4
from aad import lambda_handler as aad_handler
from local import lambda_handler as kinde_handler
from shared import AuthPolicy
import os 
import jwt

def lambda_handler(event, context):
    tmp = event['methodArn'].split(':')
    apiGatewayArnTmp = tmp[5].split('/')
    awsAccountId = tmp[4]
    try:
        method, token = event['authorizationToken'].split(' ')
        print("Client method: ", method)
        print("Client token: ", token)
        print("Method ARN: " + event['methodArn'])
        if method == "Bearer":
            decoded = jwt.decode(token, options={"verify_aud": False, "verify_signature": False},)
            if decoded['iss'] == 'https://sts.windows.net/c8d9148f-9a59-4db3-827d-42ea0c2b6e2e/' and decoded['appid'] == os.environ.get("AadValidClientId"):
                return aad_handler(event, context)
            elif decoded['iss'] == 'https://auth.acm.illinois.edu' and decoded['azp'] == os.environ.get("KindeValidClientId"):
                return kinde_handler(event, context)
            else:
                raise ValueError("invalid issuer or environment token")
        principalId = token
    except Exception:
        print(traceback.format_exc(), flush=True)
        principalId = uuid4()
    print("Denying all", flush=True)
    policy = AuthPolicy(principalId, awsAccountId)
    policy.restApiId = apiGatewayArnTmp[0]
    policy.region = tmp[3]
    policy.stage = apiGatewayArnTmp[1]
    policy.denyAllMethods()
    authResponse = policy.build()
    return authResponse

