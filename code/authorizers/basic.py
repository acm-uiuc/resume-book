"""
Copyright 2015-2016 Amazon.com, Inc. or its affiliates. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

     http://aws.amazon.com/apache2.0/

or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
"""
from __future__ import print_function
from shared import AuthPolicy
import base64
from roles import setRolePolicies


def lambda_handler(event, context):
    """Do not print the auth token unless absolutely necessary """
    method, token = event['authorizationToken'].split(' ')
    print("Client method: ", method)
    print("Client token: ", token)
    print("Method ARN: " + event['methodArn'])
    errorFlag = False
    try:
        username, password = base64.b64decode(token).split(':', 1)
        print(username, password)
    except:
        print("[ERROR] Could not decode Basic authentication token. Denying all.")
        errorFlag = True
    principalId = username

    tmp = event['methodArn'].split(':')
    apiGatewayArnTmp = tmp[5].split('/')
    awsAccountId = tmp[4]

    policy = AuthPolicy(principalId, awsAccountId)
    policy.restApiId = apiGatewayArnTmp[0]
    policy.region = tmp[3]
    policy.stage = apiGatewayArnTmp[1]

    role = "admin" # get this from DB eventually
    if errorFlag:
        policy.denyAllMethods()
    else:
        policy = setRolePolicies(role, policy)

    authResponse = policy.build()
 
    # context is made available by APIGW like so: $context.authorizer.<key>
 
    authResponse['context'] = {
        'authStrategy': 'basic',
        'uid': username
    }
    
    return authResponse

