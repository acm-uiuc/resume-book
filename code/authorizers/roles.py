from shared import HttpVerb
{
    "student": [
        (HttpVerb.ALL, "/api/v1/student/*")
    ],
    "recruiter": [
        (HttpVerb.ALL, "/api/v1/recruiter/*"),
    ],
    "admin": [
        (HttpVerb.ALL, "*")
    ]
}