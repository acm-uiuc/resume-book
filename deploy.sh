#!/bin/bash
aws s3 cp docs/swagger-resume-book.yml s3://acm-uiuc-code/
sam build --template-file cloudformation/lambda.yml
sam deploy --no-confirm-changeset --no-fail-on-empty-changeset