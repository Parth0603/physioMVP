"""Subjects REST API."""
from typing import List, Optional
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.academic import SubjectResponse, SubjectCreate, SubjectUpdate
from app.services.academic_service import academic_service
from app.api.dependencies.auth import get_current_user, require_admin
from app.models.user import User

router = APIRouter(prefix="/subjects", tags=["Subjects"])


@router.get(
    "/",
    response_model=List[SubjectResponse],
    summary="List all subjects (Available to authenticated users)",
)
def list_subjects(
    year: Optional[int] = None,
    semester: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return academic_service.list_subjects(db, year=year, semester=semester)


@router.get(
    "/{subject_id}",
    response_model=SubjectResponse,
    summary="Get single subject with units and topics hierarchy",
)
def get_subject(
    subject_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return academic_service.get_subject_by_id(db, subject_id)


@router.post(
    "/",
    response_model=SubjectResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_admin)],
    summary="Create a new subject (Admin only)",
)
def create_subject(data: SubjectCreate, db: Session = Depends(get_db)):
    return academic_service.create_subject(db, data)


@router.put(
    "/{subject_id}",
    response_model=SubjectResponse,
    dependencies=[Depends(require_admin)],
    summary="Update an existing subject (Admin only)",
)
def update_subject(subject_id: int, data: SubjectUpdate, db: Session = Depends(get_db)):
    return academic_service.update_subject(db, subject_id, data)


@router.delete(
    "/{subject_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_admin)],
    summary="Delete a subject (Admin only)",
)
def delete_subject(subject_id: int, db: Session = Depends(get_db)):
    academic_service.delete_subject(db, subject_id)
