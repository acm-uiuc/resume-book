import boto3, os
s3 = boto3.client('s3', region_name=os.environ.get("AWS_REGION", "us-east-1"))
def check_key_exists(bucket, key):
    try:
        s3.head_object(Bucket=bucket, Key=key)
        return True
    except:
        return False
    
def get_resume_url(uid: str) -> str | None:
    bucket = f'infra-resume-book-pdfs-{os.environ.get("RunEnvironment", "prod")}'
    filename = f'resume_{uid}.pdf'
    print("get resume", bucket, filename)
    if not check_key_exists(bucket, filename):
        return None
    return s3.generate_presigned_url(
        ClientMethod="get_object",
        Params={
            "Bucket": bucket,
            "Key": filename
        },
        ExpiresIn=3600
    )