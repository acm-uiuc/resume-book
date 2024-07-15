from boto3.dynamodb.conditions import Attr, Or, And
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
    for level in highest_year_by_level.keys():
        preprocessed_profile[f'_meta_highest_yearEnded_{level}'] = highest_year_by_level[level]
    for level in highest_gpa_by_level.keys():
        preprocessed_profile[f'_meta_highest_gpa_{level}'] = highest_gpa_by_level[level]
    preprocessed_profile['_meta_majors'] = list(set([x['major'][0] for x in degrees if 'major' in x and len(x['major']) > 0]))
    preprocessed_profile['_meta_minors'] = list(set([x['minor'][0] for x in degrees if 'minor' in x and len(x['minor']) > 0]))
    
    return preprocessed_profile

def unpreprocess_profile(profile: dict) -> dict:
    # Create a new dictionary without the _meta_ keys
    unprocessed_profile = {key: value for key, value in profile.items() if not key.startswith('_meta_')}
    return unprocessed_profile


def construct_filter_query(degree_options, gpa, graduation_years, majors):
    # Creating list of conditions
    condition_list = []

    # GPA filter
    if gpa is not None:
        gpa_conditions = [Attr(f'_meta_highest_gpa.{degree}').gte(gpa) for degree in degree_options]
        if gpa_conditions:
            condition_list.append(Or(*gpa_conditions))
    
    # Graduation years filter
    if graduation_years:
        graduation_conditions = [Attr(f'_meta_highest_yearEnded.{degree}').is_in(graduation_years) for degree in degree_options]
        if graduation_conditions:
            condition_list.append(Or(*graduation_conditions))

    # Majors filter
    if majors:
        major_conditions = [Attr('_meta_majors').contains(major) for major in majors]
        condition_list.append(Or(*major_conditions))
    
    # Combining all conditions with AND
    if condition_list:
        combined_filter = And(*condition_list)
    else:
        combined_filter = None
    return combined_filter