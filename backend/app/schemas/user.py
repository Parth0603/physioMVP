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
    enrollment_id: Optional[str] = None


class StudentProfileCreate(StudentProfileBase):
    pass


class StudentProfileUpdate(BaseModel):
    institution: Optional[str] = None
    course: Optional[str] = None
    academic_year: Optional[int] = None
    semester: Optional[int] = None
    enrollment_id: Optional[str] = None


class StudentProfileResponse(StudentProfileBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class FacultyProfileBase(BaseModel):
    institution: Optional[str] = None
    department: str = "Musculoskeletal & Orthopedics"
    designation: str = "Assistant Professor"
    subjects_taught: Optional[str] = "Biomechanics & Kinesiology, Orthopedics"
    faculty_id_number: Optional[str] = None


class FacultyProfileCreate(FacultyProfileBase):
    pass


class FacultyProfileUpdate(BaseModel):
    institution: Optional[str] = None
    department: Optional[str] = None
    designation: Optional[str] = None
    subjects_taught: Optional[str] = None
    faculty_id_number: Optional[str] = None


class FacultyProfileResponse(FacultyProfileBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AdminProfileBase(BaseModel):
    institution: Optional[str] = None
    department: str = "Academic Affairs & Examination Council"
    designation: str = "Academic Administrator"
    employee_id: Optional[str] = None


class AdminProfileCreate(AdminProfileBase):
    pass


class AdminProfileUpdate(BaseModel):
    institution: Optional[str] = None
    department: Optional[str] = None
    designation: Optional[str] = None
    employee_id: Optional[str] = None


class AdminProfileResponse(AdminProfileBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ProfileUpdateRequest(BaseModel):
    name: Optional[str] = None
    institution: Optional[str] = None
    # Student fields
    course: Optional[str] = None
    academic_year: Optional[int] = None
    semester: Optional[int] = None
    enrollment_id: Optional[str] = None
    # Faculty fields
    department: Optional[str] = None
    designation: Optional[str] = None
    subjects_taught: Optional[str] = None
    faculty_id_number: Optional[str] = None
    # Admin fields
    employee_id: Optional[str] = None


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
    faculty_profile: Optional[FacultyProfileResponse] = None
    admin_profile: Optional[AdminProfileResponse] = None

    class Config:
        from_attributes = True
