import boto3, os

class Student:
    uid: int
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

    def __init__(self, uid, name, email, linkedin, degree, majors, minors, gpa, year, bio, skills, position, work_auth, sponsor):
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
dynamo_table = 'infra-resume-book-users'

def get_user(id: int) -> str | None:
    response = client.get_item(
        TableName=dynamo_table,
        Key={
            'id': id
        }
    )


def update_user(id, body):
    temp = {}
    attributes = {"name", "email", "linkedin", "degree", "majors", "minors", "gpa", "year", "bio", "skills", "position", "sponsor"}
    for key, value in body.items():
        if key in attributes:
            temp[key] = value

    response = client.update_item(
        TableName=dynamo_table,
        Key={
            'id': id
        },
        AttributeUpdates = {
            'id': {
                'Value' : temp,
            },
        },
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
)

def register_user(uid, name, email, linkedin, degree, majors, minors, gpa, year, bio, skills, position, work_auth, sponsor):
    client.put_item(
        TableName=dynamo_table,
        Item={
            "uid": {'N': uid},
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

