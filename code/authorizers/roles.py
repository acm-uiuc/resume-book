from shared import HttpVerb, AuthPolicy
rolePolicies = {
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

def setRolePolicies(role: str, policy: AuthPolicy) -> AuthPolicy:
    try:
        policies = rolePolicies[role]
        for policy in policies:
            policy.allowMethod(*policy)
    except KeyError:
        print(f"[ERROR] Role {role} not found in policies, denying all routes.")
        policy.denyAllMethods()
    return policy