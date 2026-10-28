import os, json, boto3
from botocore.config import Config

_lambda_client = None

def embed_texts(texts, client):
    function_name = os.environ["EmbeddingLambdaFunctionName"]
    payload = json.dumps({"texts": texts})
    response = client.invoke(
        FunctionName=function_name,
        InvocationType="RequestResponse",
        Payload=payload,
    )
    if "FunctionError" in response:
        raise RuntimeError("Embedding Lambda failed")
    
    response_data = json.loads(response["Payload"].read())
    embeddings = response_data["embeddings"]

    if len(embeddings) != len(texts):
        raise RuntimeError("Invalid embedding response")
    
    return embeddings

def get_lambda_client():
    global _lambda_client
    if _lambda_client is None:
        _lambda_client = boto3.client("lambda", config=Config(
            use_dualstack_endpoint=True,
            connect_timeout=5,
            read_timeout=40,
            retries={"mode": "standard", "total_max_attempts": 1},
        ))
    return _lambda_client