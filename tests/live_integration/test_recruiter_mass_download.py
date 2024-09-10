import requests

def test_unauthenticated(api_client):
    """Sad Path: Test that accessing the profile when not correctly authenticated returns a failure."""
    response = api_client.get(
        "/api/v1/student/profile", headers={"Authorization": "Bearer invalid"}
    )
    assert response.status_code == 403
    assert response.json() == {
        "Message": "User is not authorized to access this resource with an explicit deny"
    }

def test_student_noaccess(api_client, jwt_generator):
    """Sad Path: Test that accessing the profile when authenticated as a student returns a failure."""
    jwt = jwt_generator(role="student", env="dev", email="noone@testing.megacorp.com")
    response = api_client.post(
        "/api/v1/recruiter/mass_download", headers={"Authorization": f"Bearer {jwt}"}
    )
    assert response.status_code == 403
    assert response.json() == {
        "Message": "User is not authorized to access this resource"
    }


def test_one_profile(api_client, jwt_generator):
    """Happy path: test that we can download one profile."""
    jwt = jwt_generator(role="recruiter", env="dev", email="noone@testing.megacorp.com")
    response = api_client.post(
        "/api/v1/recruiter/mass_download", headers={"Authorization": f"Bearer {jwt}"},
        json={"usernames": ["dsingh14@illinois.edu"]}
    )
    assert response.status_code == 200
    rjson = response.json()
    assert len(rjson) == 1
    s3resp = requests.get(rjson[0])
    assert s3resp.status_code == 200
    
def test_twenty_profiles(api_client, jwt_generator):
    """Happy path: test that we can download one profile."""
    jwt = jwt_generator(role="recruiter", env="dev", email="noone@testing.megacorp.com")
    response = api_client.post(
        "/api/v1/recruiter/mass_download", headers={"Authorization": f"Bearer {jwt}"},
        json={"usernames": ["dsingh14@illinois.edu"] * 20}
    )
    assert response.status_code == 200
    rjson = response.json()
    assert len(rjson) == 20
    s3resp = requests.get(rjson[0])
    assert s3resp.status_code == 200
    s3resp = requests.get(rjson[10])
    assert s3resp.status_code == 200
    s3resp = requests.get(rjson[19])
    assert s3resp.status_code == 200