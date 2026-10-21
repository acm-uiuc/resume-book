from embeddings.app import lambda_handler, EmbeddingRequest, embed_text
from pydantic import ValidationError
import pytest
import json
from io import BytesIO
from unittest.mock import Mock, patch, call

#input validation
def test_rejects_empty_texts():
    with pytest.raises(ValidationError) as exc_info:
        EmbeddingRequest.model_validate({"texts": []})
    assert exc_info.value.errors()[0]["loc"] == ("texts",)

def test_rejects_empty_string():
    with pytest.raises(ValidationError) as exc_info:
        EmbeddingRequest.model_validate({"texts": ["  test  ", ""]})
    assert exc_info.value.errors()[0]["loc"] == ("texts", 1)

def test_preserves_valid_text():
    request = EmbeddingRequest.model_validate({"texts": ["  test  "]})
    assert request.texts[0] == "  test  "

def test_raises_safe_error():
    with pytest.raises(ValueError) as exc_info:
        lambda_handler({"texts": [""]}, None)
    assert str(exc_info.value) == "Invalid embedding request"

def test_rejects_whitespace_only():
    with pytest.raises(ValidationError) as exc_info:
        EmbeddingRequest.model_validate({"texts": ["    "]})
    assert exc_info.value.errors()[0]["loc"] == ("texts", 0)

def test_rejects_non_string():
    with pytest.raises(ValidationError) as exc_info:
        EmbeddingRequest.model_validate({"texts": [12345]})
    assert exc_info.value.errors()[0]["loc"] == ("texts", 0)

#test API call
def test_embed_text_returns_expected_vector(): 
    dummy_text = "Masters student studying computer science at MIT, with proficiency in C++"
    expected_vector = [i / 1024 for i in range(1024)]
    expected_response = {"embedding": expected_vector}

    response_bytes = json.dumps(expected_response).encode("utf-8")
    response_body = BytesIO(response_bytes)

    client = Mock(spec=["invoke_model"])
    client.invoke_model.return_value = {"body": response_body}

    response = embed_text(dummy_text, client)

    assert response == expected_vector
    client.invoke_model.assert_called_once()
    arguments = client.invoke_model.call_args.kwargs
    request_body = json.loads(arguments["body"])

    assert arguments["modelId"] == "amazon.titan-embed-text-v2:0"
    assert request_body["inputText"] == dummy_text
    assert request_body["dimensions"] == 1024   
    assert request_body["normalize"] is True

def test_embed_text_rejects_wrong_length(): 
    dummy_text = "Masters student studying computer science at MIT, with proficiency in C++"
    expected_vector = [i / 1024 for i in range(1023)]
    expected_response = {"embedding": expected_vector}

    response_bytes = json.dumps(expected_response).encode("utf-8")
    response_body = BytesIO(response_bytes)

    client = Mock(spec=["invoke_model"])
    client.invoke_model.return_value = {"body": response_body}


    with pytest.raises(ValueError) as exc_info:
        embed_text(dummy_text, client)
    assert str(exc_info.value) == "Invalid embedding response"

def test_handler_returns_embeddings_in_order():
    text1 = "Masters student studying computer science at MIT, with proficiency in C++"
    text2 = "CS Student at UIUC"
    expected_vector1 = [i / 1024 for i in range(1024)]
    expected_vector2 = [(i + 12) / 1024 for i in range(1024)]
    expected_response = {"embeddings": [expected_vector1, expected_vector2]}
    
    client = Mock(spec=["invoke_model"])

    with patch("embeddings.app.get_bedrock_client", return_value=client):
        with patch("embeddings.app.embed_text") as mock_embed:
            mock_embed.side_effect = [expected_vector1, expected_vector2]
            result = lambda_handler({"texts": [text1, text2]}, None)
    assert result == expected_response
    assert mock_embed.call_args_list == [
        call(text1, client),
        call(text2, client)
    ]
