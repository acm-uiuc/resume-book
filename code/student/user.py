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

def get_user(uid: int) -> str | None:
    response = client.get_item(
        TableName=dynamo_table,
        Key={
            'uid': uid
        }
    )

def update_user(uid, name = None, email = None, linkedin = None, degree = None, majors = None, minors = None, gpa = None, year = None, bio = None, skills = None, position = None, work_auth = None, sponsor = None):
    response = client.update_item(
        TableName=dynamo_table,
        Key={
            'uid': uid
        },
        UpdateExpression='SET #n = :n, #e = :e, #l = :l, #d = :d, #ma = list_append(#ma, :ma), #mi = list_append(#mi, :mi), #g = :g, #y = :y, #b = :b, #sk = list_append(#sk, :sk), #p = :p, #sp = :sp',
        ExpressionAttributeNames={
        '#n': "name",
        '#e': "email",
        '#l': "linkedin",
        '#d': "degree",
        '#ma': "majors",
        '#mi': "minors",
        '#g': "gpa",
        '#y': "year",
        '#b': "bio",
        '#sk': "skills",
        '#p': "position",
        '#sp': "sponsor"
    },
        ExpressionAttributeValues={
        ':n': {'S': name},
        ':e': {'S': email},
        ':l': {'S': linkedin},
        ':d': {'N': degree},
        ':ma': {'SS': majors},
        ':mi': {'SS': minors},
        ':g': {'N': gpa},
        ':y': {'S': year},
        ':b': {'S': bio},
        ':sk': {'SS': skills},
        ':p': {'N': position},
        ':w': {'BOOL': work_auth},
        ':ma': {'BOOL': sponsor},
    }
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