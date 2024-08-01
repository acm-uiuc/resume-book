from roles import setRolePolicies
from shared import AuthPolicy
import jwt
import requests
import json
import os

def get_jwks():
    jwks_url = "https://auth.acm.illinois.edu/.well-known/jwks.json"
    response = requests.get(jwks_url)
    response.raise_for_status()
    return response.json()


def get_public_key(jwks, kid):
    for jwk in jwks["keys"]:
        if jwk["kid"] == kid:
            return jwt.algorithms.RSAAlgorithm.from_jwk(json.dumps(jwk))
    raise Exception("Public key not found.")


ALGORITHMS = ["RS256"]
RUN_ENV = os.environ.get("RunEnvironment")

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
    if method == "Bearer" and token != "" and token:
        unverified_header = jwt.get_unverified_header(token)
        jwks = get_jwks()
        rsa_key = get_public_key(jwks, unverified_header["kid"])
        decoded = jwt.decode(token, rsa_key, algorithms=ALGORITHMS, options={"verify_aud": False},)
        if f"recruiter:resume-book-{RUN_ENV}" in decoded['permissions']:
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

