"""Student Progress REST API."""
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.progress import (
    StudentProgressResponse,
    StudentProgressUpdate,
    OverallProgressSummary,
)
from app.services.progress_service import progress_service
from app.api.dependencies.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/progress", tags=["Student Progress & Mastery"])


@router.get(
    "/summary",
    response_model=OverallProgressSummary,
    summary="Get overall learning progress summary for current student",
)
def get_progress_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return progress_service.get_student_summary(db, current_user.id)


@router.get(
    "/",
    response_model=List[StudentProgressResponse],
    summary="Get all topic progress records for current student",
)
def get_student_progress(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return progress_service.get_student_progress_list(db, current_user.id)


@router.post(
    "/topic/{topic_id}",
    response_model=StudentProgressResponse,
    summary="Update or initialize progress for a specific topic",
)
def update_topic_progress(
    topic_id: int,
    data: StudentProgressUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return progress_service.update_or_create_progress(db, current_user.id, topic_id, data)
