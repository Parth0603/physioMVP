"""Question and Option schemas for practice/assessment foundation."""
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel
from app.models.question import QuestionType
from app.models.academic import DifficultyLevel


class QuestionOptionBase(BaseModel):
    option_text: str
    is_correct: bool = False


class QuestionOptionCreate(QuestionOptionBase):
    pass


class QuestionOptionResponse(QuestionOptionBase):
    id: int
    question_id: int

    class Config:
        from_attributes = True


class QuestionBase(BaseModel):
    question_text: str
    question_type: QuestionType = QuestionType.MCQ
    difficulty_level: DifficultyLevel = DifficultyLevel.BEGINNER
    explanation: Optional[str] = None
    correct_answer: str
    is_verified: bool = False


class QuestionCreate(QuestionBase):
    topic_id: int
    options: Optional[List[QuestionOptionCreate]] = []


class QuestionUpdate(BaseModel):
    question_text: Optional[str] = None
    question_type: Optional[QuestionType] = None
    difficulty_level: Optional[DifficultyLevel] = None
    explanation: Optional[str] = None
    correct_answer: Optional[str] = None
    is_verified: Optional[bool] = None


class QuestionResponse(QuestionBase):
    id: int
    topic_id: int
    created_at: datetime
    options: List[QuestionOptionResponse] = []

    class Config:
        from_attributes = True
