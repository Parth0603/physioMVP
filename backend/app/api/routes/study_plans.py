"""Study Plans REST API."""
from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.study_plan import StudyPlanResponse, StudyPlanCreate
from app.services.study_plan_service import study_plan_service
from app.api.dependencies.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/study-plans", tags=["Study Plans Foundation"])


@router.get(
    "/active",
    response_model=Optional[StudyPlanResponse],
    summary="Get current student's active study plan (null if assessment pending)",
)
def get_active_plan(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return study_plan_service.get_active_plan(db, current_user.id)


@router.post(
    "/",
    response_model=StudyPlanResponse,
    summary="Create or seed a study plan track",
)
def create_study_plan(
    data: StudyPlanCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return study_plan_service.create_placeholder_plan(db, current_user.id, data)
