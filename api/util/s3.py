import traceback
from util.logging import get_logger
import boto3
import re
import aioboto3
import asyncio
logger = get_logger()

async def async_generate_presigned_urls(bucket_name, keys, expiration=14400):
    async with aioboto3.client('s3') as s3_client:
        tasks = []
        
        for key in keys:
            tasks.append(
                s3_client.generate_presigned_url(
                    'get_object',
                    Params={'Bucket': bucket_name, 'Key': key},
                    ExpiresIn=expiration
                )
            )
        
        # Gather all presigned URL creation tasks asynchronously
        presigned_urls = await asyncio.gather(*tasks)
        
        return presigned_urls

def create_presigned_url_from_s3_url(s3_client, s3_url, expiration=60):
    """
    Generate a presigned URL to share an S3 object

    :param s3_url: S3 URL (e.g., 's3://bucket_name/object_key')
    :param expiration: Time in seconds for the presigned URL to remain valid
    :return: Presigned URL as string. If error, returns None.
    """
    # Extract bucket name and object key from the S3 URL
    match = re.match(r's3://([^/]+)/(.+)', s3_url)
    if not match:
        raise ValueError(f"Invalid S3 URL: {s3_url}")
    
    bucket_name, object_key = match.groups()

    try:
        # Generate the presigned URL
        response = s3_client.generate_presigned_url('get_object',
                                                    Params={'Bucket': bucket_name,
                                                            'Key': object_key},
                                                    ExpiresIn=expiration)
    except boto3.exceptions.S3UploadFailedError as e:
        print(e)
        return None

    return response

def create_presigned_url_for_put(s3_client, bucket_name, object_key, file_size, expiration=300):
    """
    Generate a presigned URL to upload an S3 object

    :param bucket_name: The name of the S3 bucket
    :param object_key: The object key (path including the file name) in the S3 bucket
    :param file_size: The size of the file in bytes
    :param expiration: Time in seconds for the presigned URL to remain valid
    :return: Presigned URL as string. If error, returns None.
    """
    try:
        # Generate the presigned URL for PUT operation
        response = s3_client.generate_presigned_url('put_object',
                                                    Params={
                                                        'Bucket': bucket_name,
                                                        'Key': object_key,
                                                        'ContentLength': file_size,
                                                        'ContentType': 'application/pdf'
                                                    },
                                                    ExpiresIn=expiration)
    except Exception:
        logger.error(traceback.format_exc())
        return None

    return response