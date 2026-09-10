"""Assessment Pydantic schemas for tests, submissions, and detailed topic breakdowns."""
from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, ConfigDict
from app.models.assessment import AssessmentType
from app.schemas.question import QuestionResponse


class AssessmentQuestionItem(BaseModel):
    id: int
    question_id: int
    order_index: int
    question: QuestionResponse

    model_config = ConfigDict(from_attributes=True)


class AssessmentBase(BaseModel):
    title: str
    description: Optional[str] = None
    subject_id: Optional[int] = None
    assessment_type: AssessmentType = AssessmentType.DIAGNOSTIC
    duration_minutes: int = 30
    is_active: bool = True


class AssessmentCreate(AssessmentBase):
    question_ids: Optional[List[int]] = []


class AssessmentResponse(AssessmentBase):
    id: int
    created_at: datetime
    question_count: int = 0

    model_config = ConfigDict(from_attributes=True)


# Schema sent to student for taking the test (correct answers masked)
class OptionForTest(BaseModel):
    id: int
    option_text: str

    model_config = ConfigDict(from_attributes=True)


class QuestionForTest(BaseModel):
    id: int
    topic_id: int
    topic_name: str
    question_text: str
    question_type: str
    difficulty_level: str
    options: List[OptionForTest]

    model_config = ConfigDict(from_attributes=True)


class AssessmentStartResponse(BaseModel):
    assessment_id: int
    title: str
    description: Optional[str] = None
    duration_minutes: int
    total_questions: int
    questions: List[QuestionForTest]


class AnswerSubmission(BaseModel):
    question_id: int
    selected_option_text: Optional[str] = None
    answer: Optional[str] = None
    time_taken_seconds: int = 0


class AssessmentSubmitRequest(BaseModel):
    answers: List[AnswerSubmission]


class TopicPerformance(BaseModel):
    topic_id: int
    topic_name: str
    total_questions: int
    correct_count: int
    accuracy_percentage: float
    mastery_score_before: float
    mastery_score_after: float
    mastery_band: str
    priority_level: int


class AssessmentResultResponse(BaseModel):
    assessment_id: int
    assessment_title: str
    total_questions: int
    correct_answers: int
    incorrect_answers: int
    accuracy_percentage: float
    total_time_seconds: int
    topic_performances: List[TopicPerformance]
    strong_areas: List[str]
    weak_areas: List[str]
    recommended_focus: List[str]
    study_plan_id: Optional[int] = None
