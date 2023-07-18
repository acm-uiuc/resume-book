def lambda_handler(event, context):
    print(event['httpMethod'], event['pathParameters'], event['queryStringParameters'])
    return {
        "statusCode": 200,
        "body": "UP"
    }