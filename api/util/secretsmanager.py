import json
from typing import Dict
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