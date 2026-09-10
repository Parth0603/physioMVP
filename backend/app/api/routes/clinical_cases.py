"""Clinical Cases API endpoints for clinical reasoning and vignette exercises."""
from typing import List, Optional
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.clinical_case import (
    ClinicalCaseResponse,
    ClinicalCaseSubmissionRequest,
    ClinicalCaseResultResponse,
)
from app.services.clinical_case_service import clinical_case_service

router = APIRouter(prefix="/clinical-cases", tags=["Clinical Cases & Reasoning"])


@router.get(
    "/",
    response_model=List[ClinicalCaseResponse],
    summary="List verified clinical cases, optionally filtered by topic",
)
def list_clinical_cases(
    topic_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return clinical_case_service.list_cases(db, topic_id)


@router.get(
    "/{case_id}",
    response_model=ClinicalCaseResponse,
    summary="Get full clinical case patient vignette and findings",
)
def get_clinical_case(
    case_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return clinical_case_service.get_case(db, case_id)


@router.post(
    "/{case_id}/submit",
    response_model=ClinicalCaseResultResponse,
    summary="Submit 3-stage clinical reasoning response and receive rubric feedback",
)
def submit_clinical_case(
    case_id: int,
    req: ClinicalCaseSubmissionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return clinical_case_service.evaluate_case(db, current_user.id, case_id, req)
