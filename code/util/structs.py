from typing import List, Literal, Optional
from pydantic import BaseModel, ConfigDict, EmailStr, AnyUrl, HttpUrl

class DegreeListing(BaseModel):
    model_config = ConfigDict(extra="forbid")
    level: str
    yearStarted: int
    yearEnded: Optional[int] = None
    institution: str
    major: List[str]
    minor: List[str]
    gpa: float

class StudentProfileDetails(BaseModel):
    model_config = ConfigDict(extra="forbid")
    username: str
    name: str
    email: EmailStr
    linkedin: Optional[HttpUrl | Literal[""]] = None
    github: Optional[HttpUrl | Literal[""]] = None
    website: Optional[HttpUrl | Literal[""]] = None
    degrees: List[DegreeListing]
    bio: str
    skills: List[str]
    work_auth_required: bool
    sponsorship_required: bool
    resumePdfUrl: AnyUrl

class ResumeUploadPresignedRequest(BaseModel):
    file_size: int

DEFAULT_USER_PROFILE = {
    "defaultResponse": True,
    "username": "someone@illinois.edu",
    "name": "John Doe",
    "email": "someone@illinois.edu",
    "linkedin": "",
    "github": "",
    "website": "",
    "degrees": [],
    "bio": "Student at the University of Illinois Urbana-Champaign seeking software engineering roles.",
    "skills": ["Python", "Java", "C++"],
    "work_auth_required": False,
    "sponsorship_required": False,
    "resumePdfUrl": ""
}


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
