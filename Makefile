common_params = --no-confirm-changeset --no-fail-on-empty-changeset --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM CAPABILITY_AUTO_EXPAND
run_env = ParameterKey=RunEnvironment,ParameterValue
prod_aws_account = 298118738376
qa_aws_account = 427040638965

.PHONY: generate_jwt

check_account_prod:
	@aws_account_id=$$(aws sts get-caller-identity --query Account --output text); \
	if [ "$$aws_account_id" != "$(prod_aws_account)" ]; then \
		echo "Error: running in incorrect account $$aws_account_id, expected account ID $(prod_aws_account)"; \
		exit 1; \
	fi
check_account_qa:
	@aws_account_id=$$(aws sts get-caller-identity --query Account --output text); \
	if [ "$$aws_account_id" != "$(qa_aws_account)" ]; then \
		echo "Error: running in incorrect account $$aws_account_id, expected account ID $(qa_aws_account)"; \
		exit 1; \
	fi
build:
	sam build --template-file cloudformation/main.yml
local:
	sam local start-api --env-vars local.env.json --warm-containers EAGER
deploy_prod: check_account_prod build 
	aws sts get-caller-identity --query Account --output text
	sam deploy $(common_params) --parameter-overrides $(run_env)=prod
deploy_qa: check_account_qa build
	sam deploy $(common_params) --parameter-overrides $(run_env)=dev

install_deps_python:
	pip install -r tests/live_integration/requirements.txt
	pip install -r api/requirements-testing.txt

install_deps_node:
	cd clientv2 && corepack enable && yarn

install_deps_node_e2e:
	cd e2e && corepack enable && yarn && yarn run install

test_live_integration: install_deps_python
	pytest -rP tests/live_integration/

test_unit: install_deps_python install_deps_node
	pytest -rP api/
	cd clientv2 && yarn test

test_e2e: install_deps_node_e2e
	cd e2e && yarn run test
test_e2e_ui: install_deps_node_e2e
	cd e2e && yarn run test --ui
generate_jwt:
	python utils/generate_jwt.py
