from boto3.dynamodb.types import TypeSerializer, TypeDeserializer
def convert_to_dynamodb_json(json_data):
    serializer = TypeSerializer()
    dynamodb_json = {k: serializer.serialize(v) for k, v in json_data.items()}
    return dynamodb_json

def convert_from_dynamodb_json(dynamodb_json):
    deserializer = TypeDeserializer()
    normal_json = {k: deserializer.deserialize(v) for k, v in dynamodb_json.items()}
    return normal_json

def preprocess_profile(profile: dict) -> dict:
    preprocessed_profile = profile.copy()
    degrees = preprocessed_profile.get('degrees', [])
    
    highest_year_by_level = {}
    highest_gpa_by_level = {}

    for degree in degrees:
        level = degree.get('level')
        year_ended = degree.get('yearEnded')
        gpa = degree.get('gpa')

        if level and year_ended is not None:
            if level not in highest_year_by_level or year_ended > highest_year_by_level[level]:
                highest_year_by_level[level] = year_ended

        if level and gpa is not None:
            if level not in highest_gpa_by_level or gpa > highest_gpa_by_level[level]:
                highest_gpa_by_level[level] = gpa

    # meta attributes for easy querying
    preprocessed_profile['_meta_highest_yearEnded'] = highest_year_by_level
    preprocessed_profile['_meta_highest_gpa'] = highest_gpa_by_level
    preprocessed_profile['_meta_majors'] = list(set([x['major'][0] for x in degrees]))
    preprocessed_profile['_meta_minors'] = list(set([x['minor'][0] for x in degrees]))
    
    return preprocessed_profile

def unpreprocess_profile(profile: dict) -> dict:
    # Create a new dictionary without the _meta_ keys
    unprocessed_profile = {key: value for key, value in profile.items() if not key.startswith('_meta_')}
    return unprocessed_profile