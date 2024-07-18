build:
	sam build --template-file cloudformation/lambda.yml
local:
	sam local start-api --env-vars local.env.json --warm-containers EAGER
deploy_prod: build
	sam deploy --no-confirm-changeset --no-fail-on-empty-changeset --parameter-overrides ParameterKey=RunEnvironment,ParameterValue=prod
deploy_dev: build
	sam deploy --no-confirm-changeset --no-fail-on-empty-changeset --parameter-overrides ParameterKey=RunEnvironment,ParameterValue=dev