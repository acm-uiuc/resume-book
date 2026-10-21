from typing import Annotated
from pydantic import BaseModel, Field, StringConstraints, ValidationError
import json
import boto3

NonEmptyStr = Annotated[str, StringConstraints(strict=True, pattern=r"\S")]
FiniteNumber = Annotated[float, Field(strict=True, allow_inf_nan=False)]

class EmbeddingRequest(BaseModel):
    texts: list[NonEmptyStr] = Field(min_length=1, strict=True)

class EmbeddingResponse(BaseModel):
    embedding: list[FiniteNumber] = Field(min_length=1024, max_length=1024, strict=True)

_bedrock_client = None
def get_bedrock_client():
    global _bedrock_client
    if _bedrock_client is None:
        _bedrock_client = boto3.client("bedrock-runtime")
    return _bedrock_client

def lambda_handler(event, context): 
    try:
        request = EmbeddingRequest.model_validate(event)
    except ValidationError:
        raise ValueError("Invalid embedding request") from None

    texts = request.texts
    client = get_bedrock_client()
    embeddings = []
    for text in texts:
        embeddings.append(embed_text(text, client))

    return {"embeddings": embeddings}

def embed_text(text, client):
    request = json.dumps({"inputText": text, "dimensions": 1024, "normalize": True})
    response = client.invoke_model(
        modelId="amazon.titan-embed-text-v2:0",
        contentType="application/json",
        accept="application/json",
        body=request
    )
    response_data = json.loads(response["body"].read())
    try:
        validated_response = EmbeddingResponse.model_validate(response_data)
    except ValidationError:
        raise ValueError("Invalid embedding response") from None
    return validated_response.embedding