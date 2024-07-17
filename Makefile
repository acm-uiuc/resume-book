build:
	sam build --template-file cloudformation/lambda.yml
local:
	sam local start-api --env-vars local.env.json --warm-containers EAGER