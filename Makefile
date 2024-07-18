build:
	sam build --template-file cloudformation/lambda.yml
local:
	sam local start-api --env-vars local.env.json --warm-containers EAGER
deploy_prod: build
	sam deploy --no-confirm-changeset --no-fail-on-empty-changeset --parameter-overrides ParameterKey=RunEnvironment,ParameterValue=prod
deploy_dev: build
	sam deploy --no-confirm-changeset --no-fail-on-empty-changeset --parameter-overrides ParameterKey=ApiDomainName,ParameterValue=resume-api-dev.acm.illinois.edu ParameterKey=ApiCertificateArn,ParameterValue=arn:aws:acm:us-east-1:427040638965:certificate/07a0f957-15ae-4330-be14-25814728b981 ParameterKey=RunEnvironment,ParameterValue=dev