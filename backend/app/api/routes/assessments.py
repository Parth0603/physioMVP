"""Assessments REST API."""
from typing import List, Optional
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.assessment import (
    AssessmentResponse,
    AssessmentCreate,
    AssessmentStartResponse,
    AssessmentSubmitRequest,
    AssessmentResultResponse,
)
from app.services.assessment_service import assessment_service
from app.api.dependencies.auth import get_current_user, require_admin, require_faculty
from app.models.user import User

router = APIRouter(prefix="/assessments", tags=["Assessments & Diagnostic Engine"])


@router.get(
    "/",
    response_model=List[AssessmentResponse],
    summary="List all active assessments (diagnostic & practice tests)",
)
def list_assessments(
    subject_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return assessment_service.list_assessments(db, subject_id)


@router.post(
    "/",
    response_model=AssessmentResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_faculty)],
    summary="Create a new assessment configuration (Faculty or Admin)",
)
def create_assessment(data: AssessmentCreate, db: Session = Depends(get_db)):
    assessment = assessment_service.create_assessment(db, data)
    return AssessmentResponse(
        id=assessment.id,
        title=assessment.title,
        description=assessment.description,
        subject_id=assessment.subject_id,
        assessment_type=assessment.assessment_type,
        duration_minutes=assessment.duration_minutes,
        is_active=assessment.is_active,
        created_at=assessment.created_at,
        question_count=len(assessment.assessment_questions) if assessment.assessment_questions else 0,
    )


@router.get(
    "/{assessment_id}/start",
    response_model=AssessmentStartResponse,
    summary="Start an assessment: returns questions with correct answers masked",
)
def start_assessment(
    assessment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return assessment_service.start_assessment(db, assessment_id)


@router.post(
    "/{assessment_id}/submit",
    response_model=AssessmentResultResponse,
    summary="Submit assessment answers: grades test, updates topic mastery & triggers personalized plan",
)
def submit_assessment(
    assessment_id: int,
    req: AssessmentSubmitRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return assessment_service.submit_assessment(db, current_user.id, assessment_id, req)


@router.get(
    "/{assessment_id}/latest-result",
    response_model=AssessmentResultResponse,
    summary="Get the student's latest result for this assessment",
)
def get_latest_assessment_result(
    assessment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return assessment_service.get_latest_result(db, current_user.id, assessment_id)

