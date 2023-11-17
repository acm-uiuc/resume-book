import boto3, os

class Student:
    object_id: str
    name: str
    email: str
    linkedin: str
    degree: int
    majors: list
    minors: list
    gpa: float
    year: str
    bio: str
    skills: list
    position: int
    work_auth: bool
    sponsor: bool

    def __init__(self, object_id, name, email, linkedin, degree, majors, minors, gpa, year, bio, skills, position, work_auth, sponsor):
        self.uid: uid
        self.name: name
        self.email: email
        self.linkedin: linkedin
        self.degree: degree
        self.majors: majors
        self.minors: minors
        self.gpa: gpa
        self.year: year
        self.bio: bio
        self.skills: skills
        self.position: position
        self.work_auth: work_auth
        self.sponsor: sponsor

client = boto3.client('dynamodb', region_name=os.environ.get('AWS_REGION', 'us-east-2'))

dynamo_table = "infra-resume-book-users"

def get_user(id: str) -> str | None:
    response = client.get_item(
        TableName=dynamo_table,
        Key={
            "object_id": id
        }
    )
    print("response",response)
    return response


def update_user(id: str, body: str) -> str | None:
    temp = {}
    attributes = {"name", "email", "linkedin", "degree", "majors", "minors", "gpa", "year", "bio", "skills", "position", "work_auth", "sponsor"}
    for key, value in body.items():
        if key in attributes:
            temp[key] = value
    # print(temp)

    update_expression = 'SET {}'.format(','.join(f'#{k}=:{k}' for k in temp))
    expression_attribute_values = {f':{k}': v for k, v in temp.items()}
    expression_attribute_names = {f'#{k}': k for k in temp}

    response = client.update_item(
        TableName=dynamo_table,
        Key={
            'object_id': id
        },
        UpdateExpression=update_expression,
        ExpressionAttributeValues=expression_attribute_values,
        ExpressionAttributeNames=expression_attribute_names,
        ReturnValues='UPDATED_NEW',
    )
    # print(response("Item"))

    #     ExpressionAttributeNames={
    #     '#n': "name",
    #     '#e': "email",
    #     '#l': "linkedin",
    #     '#d': "degree",
    #     '#ma': "majors",
    #     '#mi': "minors",
    #     '#g': "gpa",
    #     '#y': "year",
    #     '#b': "bio",
    #     '#sk': "skills",
    #     '#p': "position",
    #     '#sp': "sponsor"
    # },
    #     ExpressionAttributeValues={
    #     ':n': {'S': name},
    #     ':e': {'S': email},
    #     ':l': {'S': linkedin},
    #     ':d': {'N': degree},
    #     ':ma': {'SS': majors},
    #     ':mi': {'SS': minors},
    #     ':g': {'N': gpa},
    #     ':y': {'S': year},
    #     ':b': {'S': bio},
    #     ':sk': {'SS': skills},
    #     ':p': {'N': position},
    #     ':w': {'BOOL': work_auth},
    #     ':ma': {'BOOL': sponsor},
    # }


# USE UPDATE USER INSTEAD
def register_user(id, name, email, linkedin, degree, majors, minors, gpa, year, bio, skills, position, work_auth, sponsor):
    client.put_item(
        TableName=dynamo_table,
        Item={
            "object_id": {'S': id},
            "name": {'S': name},
            "email": {'S': email},
            "linkedin": {'S': linkedin},
            "degree": {'N': degree},
            "majors": {'SS': majors},
            "minors": {'SS': minors},
            "gpa": {'N': gpa},
            "year": {'S': year},
            "bio": {'S': bio},
            "skills": {'SS': skills},
            "position": {'N': position},
            "work_auth": {'BOOL': work_auth},
            "sponsor": {'BOOL': sponsor}
        }
    )

def check_user (id):
    uid_to_check =id
    response = client.scan(TableName=dynamo_table)
    items = response.get('Items', [])
    response = client.get_item(
        TableName=dynamo_table,
        Key={
            'id': uid_to_check
        }
    )
    
    if response == None:
        return False
    return True

