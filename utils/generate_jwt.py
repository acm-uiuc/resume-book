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

def get_parameter_from_sm(sm_client, parameter_name) ->  Dict[str, str | int]:
    try:
        # Retrieve the parameter
        response = sm_client.get_secret_value(
            SecretId=parameter_name
        )
        # Get the parameter value
        parameter_value = response['SecretString']
        # Parse the parameter value into a dictionary
        parameter_dict = json.loads(parameter_value)

        return parameter_dict

    except sm_client.exceptions.ResourceNotFoundException:
        print(f"Parameter \"{parameter_name}\" not found.", flush=True)
        return None
    except json.JSONDecodeError:
        print(f"Parameter \"{parameter_name}\" is not in valid JSON format.", flush=True)
        return None
    except Exception as e:
        print(f"An error occurred: {e}", flush=True)
        return None
    
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