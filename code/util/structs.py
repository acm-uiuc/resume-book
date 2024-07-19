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

class ProfileSearchRequest(BaseModel):
    degreeOptions: Optional[List[str]] = []
    gpa: Optional[float] = 3.0
    graduationYears: Optional[List[str]] = []
    majors: Optional[List[str]] = []

class GenerateProfileRequest(BaseModel):
    resumeText: str
    roleType: Literal["internship"] | Literal['full-time'] | Literal['research assistant']
    roleKeywords: List[str]

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



def snake_to_camel(snake_str):
    components = snake_str.split('_')
    return components[0] + ''.join(x.title() for x in components[1:])

def convert_dict_keys_snake_to_camel(d):
    if isinstance(d, dict):
        new_dict = {}
        for k, v in d.items():
            new_key = snake_to_camel(k)
            new_dict[new_key] = convert_dict_keys_snake_to_camel(v) if isinstance(v, dict) else v
        return new_dict
    return d

