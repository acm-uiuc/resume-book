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

        # Update the highest yearEnded by level
        if level and year_ended is not None:
            if level not in highest_year_by_level or year_ended > highest_year_by_level[level]:
                highest_year_by_level[level] = year_ended

        # Update the highest GPA by level
        if level and gpa is not None:
            if level not in highest_gpa_by_level or gpa > highest_gpa_by_level[level]:
                highest_gpa_by_level[level] = gpa

    # Add the highest yearEnded and GPA by level as meta attributes
    for level in highest_year_by_level:
        preprocessed_profile[f'_meta_highest_yearEnded_{level}'] = highest_year_by_level[level]
        preprocessed_profile[f'_meta_highest_gpa_{level}'] = highest_gpa_by_level[level]
    
    return preprocessed_profile

def unpreprocess_profile(profile: dict) -> dict:
    # Create a new dictionary without the _meta_ keys
    unprocessed_profile = {key: value for key, value in profile.items() if not key.startswith('_meta_')}
    return unprocessed_profile