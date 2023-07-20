"""
Copyright 2015-2016 Amazon.com, Inc. or its affiliates. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

     http://aws.amazon.com/apache2.0/

or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
"""
from __future__ import print_function
from shared import AuthPolicy, base64dec
from crypto import check_password
from roles import setRolePolicies
import boto3, os, base64
client = boto3.client('dynamodb', region_name=os.environ.get('AWS_REGION', 'us-east-1'))
dynamo_table = 'infra-resume-book-auth-data'

def lambda_handler(event, context):
    """Do not print the auth token unless absolutely necessary """
    method, token = event['authorizationToken'].split(' ')
    print("Client method: ", method)
    print("Client token: ", token)
    print("Method ARN: " + event['methodArn'])
    errorFlag = False
    username = token
    password = ""
    try:
        username, password = base64dec(token).split(':', 1)
    except Exception as e:
        print("[ERROR] Could not decode Basic authentication token. Denying all.")
        errorFlag = True
    principalId = username
    # print("Username:", username, "Password:", password, "errorFlag:", errorFlag)
    tmp = event['methodArn'].split(':')
    apiGatewayArnTmp = tmp[5].split('/')
    awsAccountId = tmp[4]

    policy = AuthPolicy(principalId, awsAccountId)
    policy.restApiId = apiGatewayArnTmp[0]
    policy.region = tmp[3]
    policy.stage = apiGatewayArnTmp[1]

    response = client.query(
        TableName=dynamo_table,
        KeyConditionExpression='username = :userStr',
        ExpressionAttributeValues={
            ':userStr': {
                "S": username
            }
        }
    )
    role = ''
    items = response['Items']
    if not items or len(items) == 0:
        errorFlag = True
    else:
        passwordHashed = items[0]['password']['S']
        errorFlag |= not check_password(password, passwordHashed)
        role = items[0]['role']['S']
    if errorFlag:
        print(f"[ERROR] User {username} could not authenticate.")
        policy.denyAllMethods()
    else:
        print(f"[INFO] User {username} with role {role} authenticated.")
        policy = setRolePolicies(role, policy)

    authResponse = policy.build()
 
    # context is made available by APIGW like so: $context.authorizer.<key>
 
    authResponse['context'] = {
        'authStrategy': 'basic',
        'uid': username,
        'roles': [role]
    }
    return authResponse

if __name__ == "__main__":
    username = input("Enter username: ")
    password = input("Enter password: ")
    templated = base64.b64encode(f'{username}:{password}'.encode("ascii")).decode("ascii")
    lambda_handler({
        'authorizationToken': f'Basic {templated}',
        'methodArn': 'arn:aws:execute-api:us-east-1:298118738376:87f11i5ebj/ESTestInvoke-stage/GET/'
    }, {})