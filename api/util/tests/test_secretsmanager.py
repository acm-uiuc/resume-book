import pytest
from moto import mock_aws
import boto3
import os
import json
from ..secretsmanager import get_parameter_from_sm


key_data = {"CLIENT_DATA": "12345", "CLIENT_SECRET": "12345"}
invalid_key_data = '{"name": "Joe", "age": null]'
@pytest.fixture
def sm_client():
    """Fixture to create a mocked KMS client using moto."""
    with mock_aws():
        client = boto3.client('secretsmanager', region_name=os.environ.get("AWS_REGION", "us-east-1"))
        yield client

@pytest.fixture
def sm_valid_key_id(sm_client):
    """Fixture to create a mock KMS key."""
    sm_client.create_secret(Name='test-secret', SecretString=json.dumps(key_data))
    return 'test-secret'


@pytest.fixture
def sm_invalid_key_id(sm_client):
    """Fixture to create a mock KMS key."""
    sm_client.create_secret(Name='test-invalid-secret', SecretString=invalid_key_data)
    return 'test-invalid-secret'

def test_valid_secret(sm_client, sm_valid_key_id):
    assert key_data == get_parameter_from_sm(sm_client, sm_valid_key_id)

def test_invalid_secret(sm_client, sm_invalid_key_id, capfd):
    assert get_parameter_from_sm(sm_client, sm_invalid_key_id) == None
    out, _ = capfd.readouterr()
    assert out == "Parameter \"test-invalid-secret\" is not in valid JSON format.\n"

def test_nonexistent_secret(sm_client, capfd):
    assert get_parameter_from_sm(sm_client, 'test-nonexistent-secret') == None
    out, _ = capfd.readouterr()
    assert out == "Parameter \"test-nonexistent-secret\" not found.\n"