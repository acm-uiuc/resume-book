import boto3
import os
import pdf2image
import tempfile
from PIL import Image
from io import BytesIO


# Function to take in a student_id and convert resume pdf to a jpg (370 x 480)
def resume_pdf_to_image(student_id: str):
    # Get the resume pdf from the s3 bucket
    filename = f"resume_{student_id}.pdf"
    s3 = boto3.client('s3', region_name=os.environ.get("AWS_REGION", "us-east-1"))
    pdf = s3.get_object(
        Bucket=f'infra-resume-book-pdfs-{os.environ.get("RunEnvironment", "prod")}',
        Key=filename
    )
    pdf_bytes = pdf['Body'].read()
    
    # Convert the pdf to a jpg
    with tempfile.TemporaryDirectory() as path:
        images_from_path = pdf2image.convert_from_bytes(pdf_bytes, output_folder=path)
        for image in images_from_path:
            image.save(os.path.join(path, f"{student_id}.jpg"), 'JPEG')
    # Resize the jpg to 370 x 480
    image = Image.open(os.path.join(path, f"{student_id}.jpg"))
    image = image.resize((370, 480))
    
    # Upload the jpg to the s3 bucket
    jpg_bytes = BytesIO()
    image.save(jpg_bytes, format='JPEG')
    jpg_bytes.seek(0)
    s3.put_object(
        Bucket=f'infra-resume-book-jpgs-{os.environ.get("RunEnvironment", "prod")}',
        Key=f"{student_id}.jpg",
        Body=jpg_bytes
    )
    
    # Return the url of the jpg
    return s3.generate_presigned_url(
        ClientMethod="get_object",
        Params={
            "Bucket": f'infra-resume-book-jpgs-{os.environ.get("RunEnvironment", "prod")}',
            "Key": f"{student_id}.jpg"
        },
        ExpiresIn=3600
    )