import traceback
import requests
import jwt
from roles import setRolePolicies
from shared import AuthPolicy

MICROSOFT_ISSUER = "https://sts.windows.net/c8d9148f-9a59-4db3-827d-42ea0c2b6e2e/"

def get_token_valid(token):
    """Requires User.Read permission"""
    response =requests.get("https://graph.microsoft.com/v1.0/me", headers={"Authorization": f"Bearer {token}"})
    response.raise_for_status()
    return True


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
            valid = get_token_valid(token)
            if not valid:
                raise ValueError("Invalid token after calling Graph API")
            decoded = jwt.decode(token, algorithms=["RS256"], issuer=MICROSOFT_ISSUER, options={"verify_aud": False, "verify_signature": False},)
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
        except requests.exceptions.HTTPError:
            print("Could not call Graph API (usually means invalid token):", traceback.format_exc(), flush=True)
            policy.denyAllMethods()
            authResponse = policy.build()
        except Exception:
            print("Unknown error occurred", traceback.format_exc(), flush=True)
            policy.denyAllMethods()
            authResponse = policy.build()
    else:
        print("Token invalid structure or not provided.")
        policy.denyAllMethods()
        authResponse = policy.build()

    return authResponse
