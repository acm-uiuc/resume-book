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
    
# write new endpoint (get_all_resumes)
def get_all_resume_urls():
    #use boto3 to download all of the resumes
    bucket = f'infra-resume-book-pdfs-{os.environ.get("RunEnvironment", "prod")}'
    response = s3.list_objects_v2(bucket)
    mylist = response['Contents']
    resume_list = []
    resume_url_list = []
    for item in mylist:
        if item['Key'].endswith('@illinois.edu.pdf'):
            resume_list.append(item['Key'])
    #then return them zipped
    for resume in resume_list:
        resume_url_list.append(get_resume_url(resume))
    return resume_url_list