"""Knowledge Base Content REST API."""
from typing import List, Optional
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.content import ContentResponse, ContentCreate, ContentUpdate
from app.services.content_service import content_service
from app.api.dependencies.auth import get_current_user, require_admin, require_faculty
from app.models.user import User

router = APIRouter(prefix="/content", tags=["Knowledge Base Content"])


@router.get(
    "/",
    response_model=List[ContentResponse],
    summary="List all content with optional topic filtering",
)
def list_content(
    topic_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return content_service.list_all_content(db, skip=skip, limit=limit, topic_id=topic_id)


@router.get(
    "/topic/{topic_id}",
    response_model=List[ContentResponse],
    summary="List content by topic (Students receive verified; Faculty/Admin see all)",
)
def get_topic_content(
    topic_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    verified_only = (current_user.role.value == "student")
    return content_service.list_content_by_topic(db, topic_id=topic_id, verified_only=verified_only)


@router.get(
    "/{content_id}",
    response_model=ContentResponse,
    summary="Get single content item",
)
def get_content(
    content_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return content_service.get_content_by_id(db, content_id)


@router.post(
    "/",
    response_model=ContentResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_faculty)],
    summary="Create educational content (Faculty or Admin)",
)
def create_content(data: ContentCreate, db: Session = Depends(get_db)):
    return content_service.create_content(db, data)


@router.put(
    "/{content_id}",
    response_model=ContentResponse,
    dependencies=[Depends(require_faculty)],
    summary="Update educational content (Faculty or Admin)",
)
def update_content(content_id: int, data: ContentUpdate, db: Session = Depends(get_db)):
    return content_service.update_content(db, content_id, data)


@router.patch(
    "/{content_id}/verify",
    response_model=ContentResponse,
    dependencies=[Depends(require_faculty)],
    summary="Verify educational content (Faculty or Admin review)",
)
def verify_content(content_id: int, is_verified: bool = True, db: Session = Depends(get_db)):
    return content_service.verify_content(db, content_id, is_verified=is_verified)


@router.delete(
    "/{content_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_admin)],
    summary="Delete content (Admin only)",
)
def delete_content(content_id: int, db: Session = Depends(get_db)):
    content_service.delete_content(db, content_id)
