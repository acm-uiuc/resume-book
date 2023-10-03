#!/bin/bash
sam build --template-file cloudformation/lambda.yml --parameter-overrides ParameterKey=ApiDomainName,ParameterValue=resume-api-dev.acm.illinois.edu ParameterKey=ApiCertificateArn,ParameterValue=arn:aws:acm:us-east-1:427040638965:certificate/07a0f957-15ae-4330-be14-25814728b981
sam deploy --no-confirm-changeset --no-fail-on-empty-changeset