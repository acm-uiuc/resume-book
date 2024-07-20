common_params = --no-confirm-changeset --no-fail-on-empty-changeset --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM CAPABILITY_AUTO_EXPAND
run_env = ParameterKey=RunEnvironment,ParameterValue
build:
	sam build --template-file cloudformation/main.yml
local:
	sam local start-api --env-vars local.env.json --warm-containers EAGER
deploy_prod: build
	sam deploy $(common_params) --parameter-overrides $(run_env)=prod
deploy_dev: build
	sam deploy $(common_params) --parameter-overrides $(run_env)=dev