"""Clinical Case schemas for reasoning practice, diagnostic evaluation, and feedback."""
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict
from app.models.academic import DifficultyLevel


class ClinicalCaseBase(BaseModel):
    title: str
    case_description: str
    patient_age: int = 45
    patient_gender: str = "Female"
    chief_complaint: Optional[str] = None
    symptoms: Optional[str] = None
    medical_history: Optional[str] = None
    assessment_findings: Optional[str] = None
    expected_hypothesis: Optional[str] = None
    expected_assessments: Optional[str] = None
    expected_management: Optional[str] = None
    key_concepts: Optional[str] = None
    difficulty_level: DifficultyLevel = DifficultyLevel.INTERMEDIATE
    is_verified: bool = True


class ClinicalCaseCreate(ClinicalCaseBase):
    topic_id: int


class ClinicalCaseResponse(ClinicalCaseBase):
    id: int
    topic_id: int
    created_at: datetime
    topic_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class ClinicalCaseSubmissionRequest(BaseModel):
    hypothesis: str
    assessments: str
    management: str


class StageFeedback(BaseModel):
    score: int
    points_identified: List[str]
    points_missed: List[str]


class ClinicalCaseResultResponse(BaseModel):
    case_id: int
    overall_score: int
    hypothesis_feedback: StageFeedback
    assessment_feedback: StageFeedback
    management_feedback: StageFeedback
    learning_recommendation: str
    topic_id: int
    new_mastery_score: Optional[float] = None
