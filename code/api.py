import mapper
def lambda_handler(event, context):
    method = event['httpMethod']
    path = event['path']
    print(f"Processing request: method {method}, path {path}.")
    return mapper.execute(method, path)