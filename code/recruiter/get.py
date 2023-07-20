import boto3, os
s3 = boto3.client('s3', region_name=os.environ.get("AWS_REGION", "us-east-1"))
def get_resume_url(uid: str) -> str:
    filename = f'resume_{uid}.pdf'
    return s3.generate_presigned_url(
        ClientMethod="get_object",
        Params={
            "Bucket": 'infra-resume-book-pdfs',
            "Key": filename
        },
        ExpiresIn=3600
    )