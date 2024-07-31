import string
import pytest 
from rdflib import Literal
from requests import Session
from urllib.parse import urljoin
import datetime
from datetime import timezone
import jwt
import os

class LiveServerSession(Session):
    def __init__(self, base_url=None):
        super().__init__()
        self.base_url = base_url

    def request(self, method, url, *args, **kwargs):
        joined_url = urljoin(self.base_url, url)
        return super().request(method, joined_url, *args, **kwargs)
    
@pytest.fixture
def api_client():
    ENDPOINT = "https://resumes.aws.qa.acmuiuc.org/"
    client = LiveServerSession(base_url=ENDPOINT)
    yield client

@pytest.fixture
def jwt_generator():
    def create_jwt(role: str = 'student', env: str = 'dev', email: str = 'admin@acm.illinois.edu'):
        JWT_SECRET = os.environ.get("RB_JWT_SECRET")
        iat = datetime.datetime.now(tz=timezone.utc)
        payload = {
            'iss': 'custom_jwt',
            'permissions': [f'{role}:resume-book-{env}'],
            'email': email,
            'exp': iat + datetime.timedelta(days=1),
            'iat': iat, 
            'nbf': iat,
            'aud': 'https://resumes.aws.qa.acmuiuc.org',
        }
        return jwt.encode(payload, JWT_SECRET, algorithm="HS256")
    yield create_jwt