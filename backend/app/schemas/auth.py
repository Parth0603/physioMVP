"""Authentication & Token Pydantic schemas."""
from typing import Optional
from pydantic import BaseModel, EmailStr
from app.models.user import UserRole


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: UserRole
    user_id: int
    name: str
    email: str


class TokenPayload(BaseModel):
    sub: Optional[str] = None
    role: Optional[str] = None
    exp: Optional[int] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: UserRole = UserRole.STUDENT
    institution: Optional[str] = "Default Physiotherapy College"
    course: Optional[str] = "Bachelor of Physiotherapy (BPT)"
    academic_year: Optional[int] = 1
    semester: Optional[int] = 1
