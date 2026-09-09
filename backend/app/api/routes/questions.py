"""Questions REST API - with full Admin & Faculty management."""
from typing import List, Optional
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.question import QuestionResponse, QuestionCreate, QuestionUpdate
from app.services.question_service import question_service
from app.api.dependencies.auth import get_current_user, require_faculty, require_admin
from app.models.user import User

router = APIRouter(prefix="/questions", tags=["Questions & Assessment Foundation"])


@router.get(
    "/",
    response_model=List[QuestionResponse],
    summary="List all questions with optional topic filter",
)
def list_all_questions(
    topic_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return question_service.list_questions(db, skip=skip, limit=limit, topic_id=topic_id)


@router.get(
    "/topic/{topic_id}",
    response_model=List[QuestionResponse],
    summary="List questions under a topic",
)
def list_questions_by_topic(
    topic_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return question_service.list_questions_by_topic(db, topic_id)


@router.get(
    "/{question_id}",
    response_model=QuestionResponse,
    summary="Get single question details with options",
)
def get_question(
    question_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return question_service.get_question_by_id(db, question_id)


@router.post(
    "/",
    response_model=QuestionResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_faculty)],
    summary="Create question with MCQ options (Faculty or Admin)",
)
def create_question(data: QuestionCreate, db: Session = Depends(get_db)):
    return question_service.create_question(db, data)


@router.put(
    "/{question_id}",
    response_model=QuestionResponse,
    dependencies=[Depends(require_faculty)],
    summary="Update question content and details (Faculty or Admin)",
)
def update_question(question_id: int, data: QuestionUpdate, db: Session = Depends(get_db)):
    return question_service.update_question(db, question_id, data)


@router.delete(
    "/{question_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_admin)],
    summary="Delete a question (Admin only)",
)
def delete_question(question_id: int, db: Session = Depends(get_db)):
    question_service.delete_question(db, question_id)
