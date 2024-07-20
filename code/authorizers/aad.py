import requests
import jwt
from jwt.algorithms import RSAAlgorithm
from roles import setRolePolicies
from shared import AuthPolicy

MICROSOFT_OPENID_CONFIG_URL = "https://login.microsoftonline.com/common/v2.0/.well-known/openid-configuration"
MICROSOFT_ISSUER = "https://sts.windows.net/c8d9148f-9a59-4db3-827d-42ea0c2b6e2e/"

def get_microsoft_public_keys():
    response = requests.get(MICROSOFT_OPENID_CONFIG_URL)
    jwks_uri = response.json()['jwks_uri']
    keys_response = requests.get(jwks_uri)
    return {key['kid']: RSAAlgorithm.from_jwk(key) for key in keys_response.json()['keys']}

public_keys = get_microsoft_public_keys()

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
        try:
            headers = jwt.get_unverified_header(token)
            key = public_keys[headers['kid']]
            
            decoded = jwt.decode(token, key=key, algorithms=["RS256"], issuer=MICROSOFT_ISSUER, options={"verify_aud": False},)
            
            setRolePolicies('student', policy)
            
            context = {
                'authStrategy': 'msal',
                'username': decoded['unique_name']
            }
            
            authResponse = policy.build()
            authResponse['context'] = context
        except jwt.ExpiredSignatureError:
            print("Token has expired")
            policy.denyAllMethods()
            authResponse = policy.build()
        except jwt.InvalidTokenError:
            print("Invalid token")
            policy.denyAllMethods()
            authResponse = policy.build()
    else:
        policy.denyAllMethods()
        authResponse = policy.build()

    return authResponse
