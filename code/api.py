import mapper
def lambda_handler(event, context):
    method = event['httpMethod']
    path = event['path']
    return mapper.execute(method, path)
