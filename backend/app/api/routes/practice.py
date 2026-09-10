"""Practice API endpoints for topic-level MCQ drills and results."""
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.question import QuestionResponse
from app.schemas.practice import MCQPracticeSubmitRequest, MCQPracticeResultResponse
from app.services.practice_service import practice_service

router = APIRouter(prefix="/practice", tags=["MCQ Practice & Drills"])


@router.get(
    "/mcq/{topic_id}",
    response_model=List[QuestionResponse],
    summary="Get verified practice MCQs for a topic with options and explanations",
)
def get_topic_mcqs(
    topic_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return practice_service.get_topic_mcqs(db, topic_id)


@router.post(
    "/mcq/{topic_id}/submit",
    response_model=MCQPracticeResultResponse,
    summary="Submit topic practice answers, record individual attempts, and update mastery",
)
def submit_topic_mcqs(
    topic_id: int,
    req: MCQPracticeSubmitRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return practice_service.submit_topic_mcqs(db, current_user.id, topic_id, req)
