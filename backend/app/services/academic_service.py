"""Academic Service for Subject, Unit, and Topic management."""
from typing import List, Optional
from sqlalchemy.orm import Session
from app.core.exceptions import EntityNotFoundException, DuplicateResourceException
from app.models.academic import Subject, Unit, Topic
from app.schemas.academic import (
    SubjectCreate, SubjectUpdate,
    UnitCreate, UnitUpdate,
    TopicCreate, TopicUpdate
)
from app.repositories.domain import subject_repo, unit_repo, topic_repo


class AcademicService:
    # --- SUBJECTS ---
    @staticmethod
    def list_subjects(db: Session, year: Optional[int] = None, semester: Optional[int] = None) -> List[Subject]:
        subjects = subject_repo.list_with_hierarchy(db)
        if year:
            subjects = [s for s in subjects if s.academic_year == year]
        if semester:
            subjects = [s for s in subjects if s.semester == semester]
        return subjects

    @staticmethod
    def get_subject_by_id(db: Session, subject_id: int) -> Subject:
        subject = subject_repo.get_with_hierarchy(db, subject_id)
        if not subject:
            raise EntityNotFoundException("Subject", subject_id)
        return subject

    @staticmethod
    def create_subject(db: Session, data: SubjectCreate) -> Subject:
        if subject_repo.get_by_code(db, data.code):
            raise DuplicateResourceException("Subject", "code", data.code)
        return subject_repo.create(db, data.dict())

    @staticmethod
    def update_subject(db: Session, subject_id: int, data: SubjectUpdate) -> Subject:
        subject = subject_repo.get(db, subject_id)
        if not subject:
            raise EntityNotFoundException("Subject", subject_id)
        return subject_repo.update(db, subject, data.dict(exclude_unset=True))

    @staticmethod
    def delete_subject(db: Session, subject_id: int) -> None:
        subject = subject_repo.get(db, subject_id)
        if not subject:
            raise EntityNotFoundException("Subject", subject_id)
        subject_repo.remove(db, subject_id)

    # --- UNITS ---
    @staticmethod
    def list_units_by_subject(db: Session, subject_id: int) -> List[Unit]:
        return unit_repo.get_by_subject(db, subject_id)

    @staticmethod
    def create_unit(db: Session, data: UnitCreate) -> Unit:
        subject = subject_repo.get(db, data.subject_id)
        if not subject:
            raise EntityNotFoundException("Subject", data.subject_id)
        return unit_repo.create(db, data.dict())

    @staticmethod
    def update_unit(db: Session, unit_id: int, data: UnitUpdate) -> Unit:
        unit = unit_repo.get(db, unit_id)
        if not unit:
            raise EntityNotFoundException("Unit", unit_id)
        return unit_repo.update(db, unit, data.dict(exclude_unset=True))

    @staticmethod
    def delete_unit(db: Session, unit_id: int) -> None:
        unit = unit_repo.get(db, unit_id)
        if not unit:
            raise EntityNotFoundException("Unit", unit_id)
        unit_repo.remove(db, unit_id)

    # --- TOPICS ---
    @staticmethod
    def list_topics_by_unit(db: Session, unit_id: int) -> List[Topic]:
        return topic_repo.get_by_unit(db, unit_id)

    @staticmethod
    def get_topic_by_id(db: Session, topic_id: int) -> Topic:
        topic = topic_repo.get(db, topic_id)
        if not topic:
            raise EntityNotFoundException("Topic", topic_id)
        return topic

    @staticmethod
    def create_topic(db: Session, data: TopicCreate) -> Topic:
        unit = unit_repo.get(db, data.unit_id)
        if not unit:
            raise EntityNotFoundException("Unit", data.unit_id)
        return topic_repo.create(db, data.dict())

    @staticmethod
    def update_topic(db: Session, topic_id: int, data: TopicUpdate) -> Topic:
        topic = topic_repo.get(db, topic_id)
        if not topic:
            raise EntityNotFoundException("Topic", topic_id)
        return topic_repo.update(db, topic, data.dict(exclude_unset=True))

    @staticmethod
    def delete_topic(db: Session, topic_id: int) -> None:
        topic = topic_repo.get(db, topic_id)
        if not topic:
            raise EntityNotFoundException("Topic", topic_id)
        topic_repo.remove(db, topic_id)


academic_service = AcademicService()
