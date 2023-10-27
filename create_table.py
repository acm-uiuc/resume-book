import boto3

def create_devices_table(dynamodb=None):
    dynamodb = boto3.resource(
        'dynamodb', region_name='us-east-2')
    table = dynamodb.create_table(
        TableName='infra-resume-book-users',
        KeySchema=[
            {
                'AttributeName': 'uin',
                'KeyType': 'HASH'  # Partition key
            }
        ],
        AttributeDefinitions=[
            {
                'AttributeName': 'uin',
                'AttributeType': 'N'
            }
        ],
        ProvisionedThroughput={
            'ReadCapacityUnits': 10,
            'WriteCapacityUnits': 10  
        }
    )
    return table


if __name__ == '__main__':
    device_table = create_devices_table()
    # Print tablle status
    print("Status:", device_table.table_status)