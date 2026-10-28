import json
from io import BytesIO
from unittest.mock import Mock 
from ..embeddings import embed_texts
import pytest

def test_embed_texts_returns_vectors(monkeypatch):
    monkeypatch.setenv("EmbeddingLambdaFunctionName", "test-embedding-lambda")
    texts = ["test resume text"]
    expected = [[n/1024 for n in range(1024)]]

    client = Mock(spec=["invoke"])
    client.invoke.return_value = ({
        "StatusCode": 200,
        "Payload": BytesIO(json.dumps({"embeddings": expected}).encode("utf-8"))
    })

    assert embed_texts(texts, client) == expected
    arguments = client.invoke.call_args.kwargs
    assert arguments["FunctionName"] == "test-embedding-lambda"
    assert arguments["InvocationType"] == "RequestResponse"
    assert json.loads(arguments["Payload"]) == {"texts": texts}
    client.invoke.assert_called_once()

def test_embed_texts_raises_on_function_error(monkeypatch):
    monkeypatch.setenv("EmbeddingLambdaFunctionName", "test-embedding-lambda")
    texts = ["test resume text"]

    client = Mock(spec=["invoke"])
    client.invoke.return_value = ({
        "StatusCode": 200,
        "FunctionError": "Unhandled",
        "Payload": BytesIO(json.dumps({"errorMessage": "Simulated failure"}).encode("utf-8"))
    })

    with pytest.raises(RuntimeError) as exc_info:
        embed_texts(texts, client)

    assert str(exc_info.value) == "Embedding Lambda failed"

def test_embed_texts_rejects_vector_count_mismatch(monkeypatch):
    monkeypatch.setenv("EmbeddingLambdaFunctionName", "test-embedding-lambda")
    texts = ["test text 1", "test text 2"]
    fake_res = [n/1024 for n in range(1024)]
    
    client = Mock(spec=["invoke"])
    client.invoke.return_value = ({
        "StatusCode": 200,
        "Payload": BytesIO(json.dumps({"embeddings": [fake_res]}).encode("utf-8"))
    })
    with pytest.raises(RuntimeError) as exc_info:
        embed_texts(texts, client)

    assert str(exc_info.value) == "Invalid embedding response"