import traceback
from uuid import uuid4
from aad import lambda_handler as aad_handler
from shared import AuthPolicy
def lambda_handler(event, context):
    tmp = event['methodArn'].split(':')
    apiGatewayArnTmp = tmp[5].split('/')
    awsAccountId = tmp[4]
    try:
        method, service, token = event['authorizationToken'].split(' ')
        print("Client method: ", method)
        print("Client token: ", token)
        print("Method ARN: " + event['methodArn'])
        if method == "Bearer":
            if service == "MSAL":
                return aad_handler(event, context)
            elif service == "Local":
                print("Got kinde request but dont have a validator yet")
        principalId = token
    except Exception:
        print(traceback.format_exc())
        principalId = uuid4()

    policy = AuthPolicy(principalId, awsAccountId)
    policy.restApiId = apiGatewayArnTmp[0]
    policy.region = tmp[3]
    policy.stage = apiGatewayArnTmp[1]
    policy.denyAllMethods()
    authResponse = policy.build()
    return authResponse

