from roles import setRolePolicies
from shared import AuthPolicy, get_parameter_from_sm
import jwt
import os
import boto3
session = boto3.Session(region_name=os.environ.get('AWS_REGION', 'us-east-1'))
client = session.client('secretsmanager')

ALGORITHMS = ["HS256"]
RUN_ENV = os.environ.get("RunEnvironment")
db_secret = get_parameter_from_sm(client, 'infra-resume-book-db-config')

def lambda_handler(event, context):

    method, token = event['authorizationToken'].split(' ')
    principalId = token

    tmp = event['methodArn'].split(':')
    apiGatewayArnTmp = tmp[5].split('/')
    awsAccountId = tmp[4]

    policy = AuthPolicy(principalId, awsAccountId)
    policy.restApiId = apiGatewayArnTmp[0]
    policy.region = tmp[3]
    policy.stage = apiGatewayArnTmp[1]
    decoded = None
    if RUN_ENV == "prod" or 'jwt_key' not in db_secret:
        policy.denyAllMethods()
    elif method == "Bearer" and token != "" and token:
        decoded = jwt.decode(token, db_secret['jwt_key'], algorithms=ALGORITHMS, options={"verify_aud": False},)
        if f"recruiter:resume-book-{RUN_ENV}" in decoded['permissions']:
            setRolePolicies('recruiter', policy)
        elif f"student:resume-book-{RUN_ENV}" in decoded['permissions']:
            setRolePolicies('student', policy)
        else:
            policy.denyAllMethods()
    else:
        policy.denyAllMethods()

    # Finally, build the policy
    authResponse = policy.build()
    context = {
        'authStrategy': 'custom_jwt',
        'username': decoded['email'] if decoded else ''
    }
 
    authResponse['context'] = context
    
    return authResponse

