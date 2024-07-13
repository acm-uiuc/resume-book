from typing import List, Optional
from pydantic import BaseModel, EmailStr, AnyUrl, HttpUrl

class DegreeListing(BaseModel):
    level: str
    yearStarted: int
    yearEnded: Optional[int] = None
    institution: str
    major: List[str]
    minor: List[str]
    gpa: float

class StudentProfileDetails(BaseModel):
    username: str
    name: str
    email: EmailStr
    linkedin: HttpUrl
    degrees: List[DegreeListing]
    bio: str
    skills: List[str]
    work_auth_required: bool
    sponsorship_required: bool
    resumePdfUrl: AnyUrl

class ResumeUploadPresignedRequest(BaseModel):
    file_size: int

if __name__ == "__main__":
    degree = DegreeListing(
        level="BS",
        yearStarted=2015,
        yearEnded=2019,
        institution="University of Example",
        major=["Computer Science"],
        minor=["Mathematics"],
        gpa=3.9
    )

    student_profile = StudentProfileDetails(
        username="johndoe",
        name="John Doe",
        email="john.doe@example.com",
        linkedin="https://www.linkedin.com/in/johndoe",
        degrees=[degree],
        bio="A highly motivated student...",
        skills=["Python", "Data Analysis"],
        work_auth_required=True,
        sponsorship_required=False,
        resumePdfUrl="https://example.com/resume.pdf"
    )

    print(student_profile)
