from roles import setRolePolicies
from shared import AuthPolicy
import jwt

def lambda_handler(event, context):
    """Do not print the auth token unless absolutely necessary """
    method, token = event['authorizationToken'].split(' ')
    print("Client method: ", method)
    print("Client token: ", token)
    print("Method ARN: " + event['methodArn'])
    principalId = token

    tmp = event['methodArn'].split(':')
    apiGatewayArnTmp = tmp[5].split('/')
    awsAccountId = tmp[4]

    policy = AuthPolicy(principalId, awsAccountId)
    policy.restApiId = apiGatewayArnTmp[0]
    policy.region = tmp[3]
    policy.stage = apiGatewayArnTmp[1]
    if method == "Bearer" and token != "" and token:
        decoded = jwt.decode(token, options={"verify_aud": False, "verify_signature": False},)
        if "recruiter:resume-book" in decoded['permissions']:
            setRolePolicies('recruiter', policy)
        else:
            policy.denyAllMethods()
    else:
        policy.denyAllMethods()

    # Finally, build the policy
    authResponse = policy.build()
    context = {
        'authStrategy': 'local',
        'username': decoded['email']
    }
 
    authResponse['context'] = context
    
    return authResponse

