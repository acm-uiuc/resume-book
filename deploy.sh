#!/bin/bash
sam build --template-file cloudformation/lambda.yml --parameter-overrides ParameterKey=RunEnvironment,ParameterValue=prod
sam deploy --no-confirm-changeset --no-fail-on-empty-changeset