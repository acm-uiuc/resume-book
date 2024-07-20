import pytest 
from requests import Session
from urllib.parse import urljoin

class LiveServerSession(Session):
    def __init__(self, base_url=None):
        super().__init__()
        self.base_url = base_url

    def request(self, method, url, *args, **kwargs):
        joined_url = urljoin(self.base_url, url)
        return super().request(method, joined_url, *args, **kwargs)
    
@pytest.fixture
def api_client():
    ENDPOINT = "https://resume-api.qa.acm.illinois.edu/"
    client = LiveServerSession(base_url=ENDPOINT)
    yield client