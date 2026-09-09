"""Adaptive Learning REST API: Learning Gaps, Priorities, and Study Plan Generation."""
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.progress import LearningGapItem, RevisionDueItem
from app.schemas.study_plan import StudyPlanResponse
from app.services.adaptive_service import adaptive_service
from app.api.dependencies.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/adaptive", tags=["Adaptive Learning Engine"])


@router.get(
    "/gaps",
    response_model=List[LearningGapItem],
    summary="Get current student's ranked learning gaps prioritized by weakness",
)
def get_learning_gaps(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return adaptive_service.identify_learning_gaps(db, current_user.id)


@router.get(
    "/revision-due",
    response_model=List[RevisionDueItem],
    summary="Get topics due for spaced revision based on retention schedule",
)
def get_revision_due(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return adaptive_service.get_revision_due(db, current_user.id)


@router.post(
    "/generate-plan",
    response_model=StudyPlanResponse,
    summary="Manually trigger generation of an updated personalized study plan",
)
def generate_study_plan(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return adaptive_service.generate_personalized_study_plan(
        db, current_user.id, reason="Student Triggered Adaptive Refresh"
    )
