"""Student Progress schemas."""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict
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

    model_config = ConfigDict(from_attributes=True)


class OverallProgressSummary(BaseModel):
    total_topics: int
    mastered_topics: int
    in_progress_topics: int
    weak_topics: int
    average_mastery: float
    total_attempts: int
    has_completed_diagnostic: bool = False


class SubjectProgressSummary(BaseModel):
    subject_id: int
    subject_name: str
    subject_code: str
    total_topics: int
    mastered_topics: int
    average_mastery: float
    strong_topics_count: int
    moderate_topics_count: int
    weak_topics_count: int


class LearningGapItem(BaseModel):
    topic_id: int
    topic_name: str
    subject_name: str
    mastery_score: float
    attempts: int
    priority_level: int
    priority_label: str  # "HIGH", "MEDIUM", "LOW"
    recommended_action: str


class RevisionDueItem(BaseModel):
    topic_id: int
    topic_name: str
    subject_name: str
    mastery_score: float
    next_review_at: Optional[datetime] = None
    is_overdue: bool = False
