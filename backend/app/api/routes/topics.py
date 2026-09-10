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


@router.post(
    "/{topic_id}/mark-reviewed",
    summary="Mark topic concepts as reviewed by the student, updating learning activity and progress",
)
def mark_topic_reviewed(
    topic_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from datetime import datetime, timezone, timedelta
    from app.models.progress import StudentProgress
    from app.models.study_plan import StudyPlanItem, PlanItemStatus
    from app.models.academic import Topic
    from app.core.exceptions import EntityNotFoundException

    topic = db.query(Topic).filter(Topic.id == topic_id).first()
    if not topic:
        raise EntityNotFoundException("Topic", topic_id)

    now = datetime.now(timezone.utc)
    progress = db.query(StudentProgress).filter(
        StudentProgress.student_id == current_user.id,
        StudentProgress.topic_id == topic_id,
    ).first()

    if not progress:
        progress = StudentProgress(
            student_id=current_user.id,
            topic_id=topic_id,
            mastery_score=40.0,
            attempts=0,
            correct_attempts=0,
            last_attempt_at=now,
            next_review_at=now + timedelta(days=3),
        )
        db.add(progress)
    else:
        progress.mastery_score = min(85.0, progress.mastery_score + 10.0)
        progress.last_attempt_at = now
        progress.next_review_at = now + timedelta(days=3)

    plan_item = db.query(StudyPlanItem).filter(
        StudyPlanItem.topic_id == topic_id,
        StudyPlanItem.status == PlanItemStatus.PENDING,
    ).first()
    if plan_item:
        plan_item.status = PlanItemStatus.COMPLETED

    db.commit()
    return {
        "status": "success",
        "topic_id": topic_id,
        "message": f"Topic '{topic.name}' marked as reviewed.",
        "mastery_level": progress.mastery_score,
        "mastery_score": progress.mastery_score,
        "next_review_at": progress.next_review_at,
    }

