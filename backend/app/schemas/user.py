"""User and Student Profile Pydantic schemas."""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr
from app.models.user import UserRole


class StudentProfileBase(BaseModel):
    institution: Optional[str] = None
    course: str = "Bachelor of Physiotherapy (BPT)"
    academic_year: int = 1
    semester: int = 1


class StudentProfileCreate(StudentProfileBase):
    pass


class StudentProfileUpdate(BaseModel):
    institution: Optional[str] = None
    course: Optional[str] = None
    academic_year: Optional[int] = None
    semester: Optional[int] = None


class StudentProfileResponse(StudentProfileBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: UserRole = UserRole.STUDENT
    is_active: bool = True


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None
    password: Optional[str] = None


class UserResponse(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime
    student_profile: Optional[StudentProfileResponse] = None

    class Config:
        from_attributes = True
