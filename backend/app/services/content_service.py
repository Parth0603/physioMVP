"""Knowledge base content service."""
from typing import List, Optional
from sqlalchemy.orm import Session
from app.core.exceptions import EntityNotFoundException
from app.models.content import Content
from app.schemas.content import ContentCreate, ContentUpdate
from app.repositories.domain import content_repo, topic_repo


class ContentService:
    @staticmethod
    def list_content_by_topic(db: Session, topic_id: int, verified_only: bool = False) -> List[Content]:
        if verified_only:
            return content_repo.get_verified_by_topic(db, topic_id)
        return content_repo.get_by_topic(db, topic_id)

    @staticmethod
    def get_content_by_id(db: Session, content_id: int) -> Content:
        content = content_repo.get(db, content_id)
        if not content:
            raise EntityNotFoundException("Content", content_id)
        return content

    @staticmethod
    def create_content(db: Session, data: ContentCreate) -> Content:
        topic = topic_repo.get(db, data.topic_id)
        if not topic:
            raise EntityNotFoundException("Topic", data.topic_id)
        return content_repo.create(db, data.dict())

    @staticmethod
    def update_content(db: Session, content_id: int, data: ContentUpdate) -> Content:
        content = content_repo.get(db, content_id)
        if not content:
            raise EntityNotFoundException("Content", content_id)
        return content_repo.update(db, content, data.dict(exclude_unset=True))

    @staticmethod
    def verify_content(db: Session, content_id: int, is_verified: bool = True) -> Content:
        content = content_repo.get(db, content_id)
        if not content:
            raise EntityNotFoundException("Content", content_id)
        return content_repo.update(db, content, {"is_verified": is_verified})

    @staticmethod
    def delete_content(db: Session, content_id: int) -> None:
        content = content_repo.get(db, content_id)
        if not content:
            raise EntityNotFoundException("Content", content_id)
        content_repo.remove(db, content_id)

    @staticmethod
    def list_all_content(db: Session, skip: int = 0, limit: int = 100, topic_id: Optional[int] = None) -> List[Content]:
        filters = {}
        if topic_id:
            filters["topic_id"] = topic_id
        return content_repo.get_multi(db, skip=skip, limit=limit, **filters)


content_service = ContentService()
