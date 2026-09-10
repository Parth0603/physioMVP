"""Viva Voce question and evaluation Pydantic schemas."""
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict
from app.models.academic import DifficultyLevel


class VivaQuestionResponse(BaseModel):
    id: int
    topic_id: int
    question_text: str
    expected_concepts: List[str]
    model_answer: Optional[str] = None
    explanation: Optional[str] = None
    difficulty_level: DifficultyLevel
    is_verified: bool
    created_at: datetime
    topic_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class VivaEvaluateRequest(BaseModel):
    answer: Optional[str] = None
    student_answer: Optional[str] = None


class VivaEvaluationResponse(BaseModel):
    question_id: int
    score: int  # 0 to 100
    key_concepts_identified: List[str]
    concepts_missed: List[str]
    feedback: str
    suggested_revision: str
    model_answer: str
    topic_id: int
    new_mastery_score: Optional[float] = None
