"""
Copyright 2015-2016 Amazon.com, Inc. or its affiliates. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

     http://aws.amazon.com/apache2.0/

or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
"""
from __future__ import print_function

import requests
from shared import AuthPolicy


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
        policy.allowAllMethods()
    else:
        policy.denyAllMethods()
    """policy.allowMethod(HttpVerb.GET, "/pets/*")"""

    # Finally, build the policy
    authResponse = policy.build()
    # new! -- add additional key-value pairs associated with the authenticated principal
    # these are made available by APIGW like so: $context.authorizer.<key>
    # additional context is cached
    graph_api_endpoint = f"https://graph.microsoft.com/v1.0/me"
    headers = {
        'Authorization': f'Bearer {token}',
        "Content-type": "application/json"
    }

    response = requests.get(graph_api_endpoint, headers=headers)

    user_object_id = "failed"
    if response.status_code == 200:
        user_data = response.json()
        user_object_id = user_data['id']
    else:
        print(f"Failed to retrieve user information. Status code: {response.status_code}")
    
    context = {
        'authStrategy': 'aad',
        'object_id': user_object_id
    }
    # context['arr'] = ['foo'] <- this is invalid, APIGW will not accept it
    # context['obj'] = {'foo':'bar'} <- also invalid
 
    authResponse['context'] = context
    
    return authResponse

