"""Student Progress schemas."""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from app.schemas.academic import TopicResponse


class StudentProgressBase(BaseModel):
    mastery_score: float = 0.0
    attempts: int = 0
    correct_attempts: int = 0
    confidence_score: float = 0.0
    last_attempt_at: Optional[datetime] = None
    next_review_at: Optional[datetime] = None


class StudentProgressCreate(StudentProgressBase):
    topic_id: int


class StudentProgressUpdate(BaseModel):
    mastery_score: Optional[float] = None
    attempts: Optional[int] = None
    correct_attempts: Optional[int] = None
    confidence_score: Optional[float] = None
    last_attempt_at: Optional[datetime] = None
    next_review_at: Optional[datetime] = None


class StudentProgressResponse(StudentProgressBase):
    id: int
    student_id: int
    topic_id: int
    updated_at: datetime
    topic: Optional[TopicResponse] = None

    class Config:
        from_attributes = True


class OverallProgressSummary(BaseModel):
    total_topics: int
    mastered_topics: int
    in_progress_topics: int
    average_mastery: float
    total_attempts: int
