"""MCQ Practice and submission Pydantic schemas."""
from typing import List, Optional
from pydantic import BaseModel


class MCQPracticeAnswer(BaseModel):
    question_id: int
    answer: Optional[str] = None
    selected_option_id: Optional[int] = None
    time_taken_seconds: int = 15


class MCQPracticeSubmitRequest(BaseModel):
    answers: List[MCQPracticeAnswer]


class MCQPracticeResultResponse(BaseModel):
    topic_id: int
    total_questions: int
    attempted: int
    correct_count: int
    incorrect_count: int
    accuracy: float
    performance_band: str  # Strong, Needs Improvement, Weak
    recommended_action: str
    new_mastery_score: float
