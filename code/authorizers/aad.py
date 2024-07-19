"""
Copyright 2015-2016 Amazon.com, Inc. or its affiliates. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

     http://aws.amazon.com/apache2.0/

or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
"""
from roles import setRolePolicies
from shared import AuthPolicy
import jwt

def lambda_handler(event, context):
    """Do not print the auth token unless absolutely necessary """
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
        setRolePolicies('student', policy)
    else:
        policy.denyAllMethods()

    # Finally, build the policy
    authResponse = policy.build()
    decoded = jwt.decode(token, options={"verify_aud": False, "verify_signature": False},)
    context = {
        'authStrategy': 'msal',
        'username': decoded['unique_name']
    }
 
    authResponse['context'] = context
    
    return authResponse

