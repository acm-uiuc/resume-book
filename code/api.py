import mapper
def lambda_handler(event, context):
    method = event['httpMethod']
    path = event['path']
    queryParams = event["queryStringParameters"]
    body = event["body"]
    if not queryParams:
        queryParams = {}
    if not body:
        body = {}
    print(f"INFO: Processing request: method {method}, path {path}.")
    try:
        return mapper.execute(method, path, queryParams, event['requestContext']['authorizer'], body)
    except KeyError:
        return mapper.execute(method, path, queryParams, {}, body)