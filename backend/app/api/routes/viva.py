"""Viva Voce API endpoints for oral exam simulations."""
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.viva import (
    VivaQuestionResponse,
    VivaEvaluateRequest,
    VivaEvaluationResponse,
)
from app.services.viva_service import viva_service

router = APIRouter(prefix="/viva", tags=["Viva Voce Practice"])


@router.get(
    "/topic/{topic_id}",
    response_model=List[VivaQuestionResponse],
    summary="Get oral viva questions for a topic",
)
def get_topic_viva_questions(
    topic_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return viva_service.list_viva_questions(db, topic_id)


@router.post(
    "/{question_id}/evaluate",
    response_model=VivaEvaluationResponse,
    summary="Submit student oral explanation and evaluate against expected key concepts",
)
def evaluate_viva_answer(
    question_id: int,
    req: VivaEvaluateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ans = req.student_answer or req.answer or ""
    return viva_service.evaluate_viva(db, current_user.id, question_id, ans)
