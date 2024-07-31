import json
from uuid import uuid4

def test_unauthenticated(api_client):
    """Sad Path: Test that accessing the profile when not correctly authenticated returns a failure."""
    response = api_client.get(
        "/api/v1/student/profile", headers={"Authorization": "Bearer invalid"}
    )
    assert response.status_code == 403
    assert response.json() == {
        "Message": "User is not authorized to access this resource with an explicit deny"
    }

def test_recruiter_noaccess_profile(api_client, jwt_generator):
    """Sad Path: Test that accessing the profile when authenticated as a recruiter returns a failure."""
    jwt = jwt_generator(role="recruiter", env="dev", email="noone@testing.megacorp.com")
    response = api_client.get(
        "/api/v1/student/profile", headers={"Authorization": f"Bearer {jwt}"}
    )
    assert response.status_code == 403
    assert response.json() == {
        "Message": "User is not authorized to access this resource"
    }

def test_default_profile(api_client, jwt_generator):
    """Happy Path: Test that the default profile is returned when the user doesn't exist"""
    jwt = jwt_generator(role="student", env="dev", email="noone@testing.illinois.edu")
    response = api_client.get(
        "/api/v1/student/profile", headers={"Authorization": f"Bearer {jwt}"}
    )
    assert response.status_code == 200
    json_response = response.json()
    assert json_response == {
        "defaultResponse": True,
        "username": "noone@testing.illinois.edu",
        "name": "John Doe",
        "email": "noone@testing.illinois.edu",
        "linkedin": "",
        "github": "",
        "website": "",
        "degrees": [],
        "bio": "Student at the University of Illinois Urbana-Champaign seeking software engineering roles.",
        "skills": ["Python", "Java", "C++"],
        "work_auth_required": False,
        "sponsorship_required": False,
    }


def test_invalid_profile_email(api_client, jwt_generator):
    """Sad Path: Test that a profile with an invalid email cannot be submited."""
    username = f"{str(uuid4())}@testing.illinois.edu"
    print(f"Using username {username}")
    jwt = jwt_generator(role="student", env="dev", email=username)
    profile = {
        "username": username,
        "name": "Test User",
        "email": "memes",
        "linkedin": "https://linkedin.com/school/university-of-illinois-urbana-champaign/",
        "github": "https://github.com/illinois",
        "website": "https://www.illinois.edu/",
        "degrees": [
            {
                "level": "Bachelor's",
                "institution": "University of Illinois Urbana-Champaign",
                "major": ["Computer Science"],
                "minor": [],
                "gpa": 4,
                "yearStarted": 2022,
                "yearEnded": 2026
            },
        ],
        "bio": "Student at the University of Illinois Urbana-Champaign seeking software engineering roles as an absolute bot.",
        "skills": ["Botting", "Being Fake"],
        "work_auth_required": False,
        "sponsorship_required": False,
    }
    response = api_client.post(
        "/api/v1/student/profile", headers={"Authorization": f"Bearer {jwt}", "Content-Type": "application/json"}, data=json.dumps(profile)
    )
    resp_json = response.json()
    assert response.status_code == 403
    assert 'message' in resp_json and resp_json['message'] == 'Error validating payload'


def test_valid_profile(api_client, jwt_generator):
    """Happy Path: Test that a valid profile can be submitted, retrieved, and deleted correctly."""
    username = f"{str(uuid4())}@testing.illinois.edu"
    print(f"Using username {username}")
    jwt = jwt_generator(role="student", env="dev", email=username)
    profile = {
        "username": username,
        "name": "Test User",
        "email": username,
        "linkedin": "https://linkedin.com/school/university-of-illinois-urbana-champaign/",
        "github": "https://github.com/illinois",
        "website": "https://www.illinois.edu/",
        "degrees": [
            {
                "level": "Bachelor's",
                "institution": "University of Illinois Urbana-Champaign",
                "major": ["Computer Science"],
                "minor": [],
                "gpa": 4,
                "yearStarted": 2022,
                "yearEnded": 2026
            },
        ],
        "bio": "Student at the University of Illinois Urbana-Champaign seeking software engineering roles as an absolute bot.",
        "skills": ["Botting", "Being Fake"],
        "work_auth_required": False,
        "sponsorship_required": False,
    }
    response = api_client.post(
        "/api/v1/student/profile", headers={"Authorization": f"Bearer {jwt}", "Content-Type": "application/json"}, data=json.dumps(profile)
    )
    assert response.status_code == 201
    assert response.json() == {'message': 'Profile saved'}
    response = api_client.get(
        "/api/v1/student/profile", headers={"Authorization": f"Bearer {jwt}", "Content-Type": "application/json"}
    )
    original_response = response.json()
    assert 'resumePdfUrl' in original_response
    profile['resumePdfUrl'] = original_response['resumePdfUrl']
    assert response.status_code == 200
    assert original_response == profile
    # TODO: Test deleting the profile (test cleanup)

def test_valid_profile_sparse(api_client, jwt_generator):
    """Happy Path: Test that a valid profile (with the bare minimum information) can be submitted, retrieved, and deleted correctly."""
    username = f"{str(uuid4())}@testing.illinois.edu"
    print(f"Using username {username}")
    jwt = jwt_generator(role="student", env="dev", email=username)
    profile = {
        "username": username,
        "name": "Test User",
        "email": username,
        "degrees": [],
        "bio": "Student at the University of Illinois Urbana-Champaign seeking software engineering roles as an absolute bot.",
        "skills": ["Botting", "Being Fake"],
        "work_auth_required": True,
        "sponsorship_required": True,
    }
    response = api_client.post(
        "/api/v1/student/profile", headers={"Authorization": f"Bearer {jwt}", "Content-Type": "application/json"}, data=json.dumps(profile)
    )
    assert response.status_code == 201
    assert response.json() == {'message': 'Profile saved'}
    response = api_client.get(
        "/api/v1/student/profile", headers={"Authorization": f"Bearer {jwt}", "Content-Type": "application/json"}
    )
    original_response = response.json()
    assert 'resumePdfUrl' in original_response
    profile['resumePdfUrl'] = original_response['resumePdfUrl']
    profile['github'] = ''
    profile['linkedin'] = ''
    profile['website'] = ''
    assert response.status_code == 200
    assert original_response == profile
    # TODO: Test deleting the profile (test cleanup)

