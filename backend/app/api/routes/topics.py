"""Topics REST API."""
from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.academic import TopicResponse, TopicCreate, TopicUpdate
from app.services.academic_service import academic_service
from app.api.dependencies.auth import get_current_user, require_admin
from app.models.user import User

router = APIRouter(prefix="/topics", tags=["Topics"])


@router.get(
    "/unit/{unit_id}",
    response_model=List[TopicResponse],
    summary="List all topics under a unit",
)
def list_topics_by_unit(
    unit_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return academic_service.list_topics_by_unit(db, unit_id)


@router.get(
    "/{topic_id}",
    response_model=TopicResponse,
    summary="Get single topic details",
)
def get_topic(
    topic_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return academic_service.get_topic_by_id(db, topic_id)


@router.post(
    "/",
    response_model=TopicResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_admin)],
    summary="Create a new topic (Admin only)",
)
def create_topic(data: TopicCreate, db: Session = Depends(get_db)):
    return academic_service.create_topic(db, data)


@router.put(
    "/{topic_id}",
    response_model=TopicResponse,
    dependencies=[Depends(require_admin)],
    summary="Update a topic (Admin only)",
)
def update_topic(topic_id: int, data: TopicUpdate, db: Session = Depends(get_db)):
    return academic_service.update_topic(db, topic_id, data)


@router.delete(
    "/{topic_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_admin)],
    summary="Delete a topic (Admin only)",
)
def delete_topic(topic_id: int, db: Session = Depends(get_db)):
    academic_service.delete_topic(db, topic_id)
