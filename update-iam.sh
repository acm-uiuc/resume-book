#!/bin/bash
aws cloudformation update-stack --stack-name=infra-resume-book-iam --template-body=file://cloudformation/iam-roles.yml --capabilities CAPABILITY_NAMED_IAM