import argparse
from typing import Dict
import json
import jwt
import os
import sys
import logging
import datetime
from datetime import timezone
JWT_SECRET = os.environ.get("RB_JWT_SECRET")
parser = argparse.ArgumentParser()
parser.add_argument("-r", "--role", help = "JWT Role", default="student")
parser.add_argument("-e", "--env", help = "JWT Env", default="dev")
parser.add_argument("-m", "--email", help = "JWT Email/username", default="admin@acm.illinois.edu")

args = parser.parse_args()
    
if not JWT_SECRET:
    logging.error("JWT Secret not found in environment variable RB_JWT_SECRET.")
    sys.exit(1)

iat = datetime.datetime.now(tz=timezone.utc)
payload = {
    'iss': 'custom_jwt',
    'permissions': [f'{args.role}:resume-book-{args.env}'],
    'email': args.email,
    'exp': iat + datetime.timedelta(days=1),
    'iat': iat, 
    'nbf': iat,
    'aud': 'https://resumes.aws.qa.acmuiuc.org',
}
jwt_str = jwt.encode(payload, JWT_SECRET, algorithm="HS256")
print(str(args))
print("=" * 20)
print(jwt_str)