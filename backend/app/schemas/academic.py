"""Academic hierarchy Pydantic schemas."""
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel
from app.models.academic import DifficultyLevel


# --- TOPIC SCHEMAS ---
class TopicBase(BaseModel):
    name: str
    description: Optional[str] = None
    order_index: int = 0
    difficulty_level: DifficultyLevel = DifficultyLevel.BEGINNER
    is_active: bool = True


class TopicCreate(TopicBase):
    unit_id: int


class TopicUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    order_index: Optional[int] = None
    difficulty_level: Optional[DifficultyLevel] = None
    is_active: Optional[bool] = None


class TopicResponse(TopicBase):
    id: int
    unit_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# --- UNIT SCHEMAS ---
class UnitBase(BaseModel):
    name: str
    description: Optional[str] = None
    order_index: int = 0


class UnitCreate(UnitBase):
    subject_id: int


class UnitUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    order_index: Optional[int] = None


class UnitResponse(UnitBase):
    id: int
    subject_id: int
    created_at: datetime
    topics: List[TopicResponse] = []

    class Config:
        from_attributes = True


# --- SUBJECT SCHEMAS ---
class SubjectBase(BaseModel):
    name: str
    code: str
    description: Optional[str] = None
    academic_year: int = 1
    semester: int = 1
    is_active: bool = True


class SubjectCreate(SubjectBase):
    pass


class SubjectUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    description: Optional[str] = None
    academic_year: Optional[int] = None
    semester: Optional[int] = None
    is_active: Optional[bool] = None


class SubjectResponse(SubjectBase):
    id: int
    created_at: datetime
    updated_at: datetime
    units: List[UnitResponse] = []

    class Config:
        from_attributes = True
