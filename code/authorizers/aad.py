import traceback
import requests
import jwt
from jwt.algorithms import RSAAlgorithm
from roles import setRolePolicies
from shared import AuthPolicy
import os 

MICROSOFT_ISSUER = "https://sts.windows.net/c8d9148f-9a59-4db3-827d-42ea0c2b6e2e/"
MICROSOFT_CLIENT_ID = os.environ.get("AadValidClientId")
MICROSOFT_KEYS_URL = f"https://login.microsoftonline.com/c8d9148f-9a59-4db3-827d-42ea0c2b6e2e/discovery/keys?appid={MICROSOFT_CLIENT_ID}"

def get_microsoft_public_keys():
    keys_response = requests.get(MICROSOFT_KEYS_URL)
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
            print(key)
            
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
            print("Invalid token:", traceback.format_exc(), flush=True)
            policy.denyAllMethods()
            authResponse = policy.build()
    else:
        policy.denyAllMethods()
        authResponse = policy.build()

    return authResponse
