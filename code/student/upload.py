import boto3, os
s3 = boto3.client('s3', region_name=os.environ.get("AWS_REGION", "us-east-1"))
def get_upload_url(filename):
    """Usually, filename is something like resume_dsingh14@illinois.edu.pdf"""
    return s3.generate_presigned_url(
        ClientMethod="put_object",
        Params={
            "Bucket": f'infra-resume-book-pdfs-{os.environ.get("RunEnvironment", "prod")}',
            "Key": filename
        },
        ExpiresIn=3600
    )
