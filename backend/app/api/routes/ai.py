"""AI module API router - prepared architecture for Part 2 and Part 3."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.ai.ai_service import ai_service
from app.api.dependencies.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/ai", tags=["AI Engine (Prepared Architecture)"])


@router.post("/explain/{topic_id}")
def explain_topic(
    topic_id: int,
    topic_name: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Grounded AI explanation request endpoint (calls AIService abstraction)."""
    return ai_service.explain_topic(db, topic_id=topic_id, topic_name=topic_name)
