from aad import lambda_handler as aad_handler
from basic import lambda_handler as basic_handler
from shared import AuthPolicy
def lambda_handler(event, context):
    method, token = event['authorizationToken'].split(' ')
    print("Client method: ", method)
    print("Client token: ", token)
    print("Method ARN: " + event['methodArn'])
    if method == "Basic":
        return basic_handler(event, context)
    if method == "Bearer":
        return aad_handler(event, context)

    principalId = token
    tmp = event['methodArn'].split(':')
    apiGatewayArnTmp = tmp[5].split('/')
    awsAccountId = tmp[4]

    policy = AuthPolicy(principalId, awsAccountId)
    policy.restApiId = apiGatewayArnTmp[0]
    policy.region = tmp[3]
    policy.stage = apiGatewayArnTmp[1]
    policy.denyAllMethods()
    authResponse = policy.build()
    return authResponse

