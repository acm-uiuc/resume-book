from boto3.dynamodb.types import TypeSerializer, TypeDeserializer
def convert_to_dynamodb_json(json_data):
    serializer = TypeSerializer()
    dynamodb_json = {k: serializer.serialize(v) for k, v in json_data.items()}
    return dynamodb_json

def convert_from_dynamodb_json(dynamodb_json):
    deserializer = TypeDeserializer()
    normal_json = {k: deserializer.deserialize(v) for k, v in dynamodb_json.items()}
    return normal_json