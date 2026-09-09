"""Knowledge base content Pydantic schemas."""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from app.models.content import ContentType
from app.models.academic import DifficultyLevel


class ContentBase(BaseModel):
    title: str
    content_type: ContentType = ContentType.CONCEPT
    content_body: str
    difficulty_level: DifficultyLevel = DifficultyLevel.BEGINNER
    reference: Optional[str] = None
    is_verified: bool = False


class ContentCreate(ContentBase):
    topic_id: int


class ContentUpdate(BaseModel):
    title: Optional[str] = None
    content_type: Optional[ContentType] = None
    content_body: Optional[str] = None
    difficulty_level: Optional[DifficultyLevel] = None
    reference: Optional[str] = None
    is_verified: Optional[bool] = None


class ContentResponse(ContentBase):
    id: int
    topic_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
