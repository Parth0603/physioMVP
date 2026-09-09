"""Student Progress service: mastery tracking, overview, and subject breakdowns."""
from typing import List, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.core.exceptions import EntityNotFoundException
from app.core.adaptive_config import adaptive_config
from app.models.progress import StudentProgress
from app.models.academic import Topic, Subject, Unit
from app.models.attempt import Attempt
from app.schemas.progress import (
    StudentProgressCreate,
    StudentProgressUpdate,
    OverallProgressSummary,
    SubjectProgressSummary,
)
from app.repositories.domain import progress_repo, topic_repo, subject_repo


class ProgressService:
    @staticmethod
    def get_student_progress_list(db: Session, student_id: int) -> List[StudentProgress]:
        return progress_repo.get_all_by_student(db, student_id)

    @staticmethod
    def get_student_topic_progress(db: Session, student_id: int, topic_id: int) -> Optional[StudentProgress]:
        return progress_repo.get_by_student_and_topic(db, student_id, topic_id)

    @staticmethod
    def update_or_create_progress(
        db: Session, student_id: int, topic_id: int, data: StudentProgressUpdate
    ) -> StudentProgress:
        progress = progress_repo.get_by_student_and_topic(db, student_id, topic_id)
        if not progress:
            topic = topic_repo.get(db, topic_id)
            if not topic:
                raise EntityNotFoundException("Topic", topic_id)
            progress = StudentProgress(
                student_id=student_id,
                topic_id=topic_id,
                mastery_score=data.mastery_score or 0.0,
                attempts=data.attempts or 0,
                correct_attempts=data.correct_attempts or 0,
                confidence_score=data.confidence_score or 0.0,
                last_attempt_at=data.last_attempt_at or datetime.now(timezone.utc),
            )
            db.add(progress)
            db.commit()
            db.refresh(progress)
            return progress

        return progress_repo.update(db, progress, data.dict(exclude_unset=True))

    @staticmethod
    def get_student_summary(db: Session, student_id: int) -> OverallProgressSummary:
        all_topics_count = db.query(Topic).filter(Topic.is_active == True).count()
        progress_records = progress_repo.get_all_by_student(db, student_id)
        has_attempts = db.query(Attempt).filter(Attempt.student_id == student_id).count() > 0

        if not progress_records:
            return OverallProgressSummary(
                total_topics=all_topics_count,
                mastered_topics=0,
                in_progress_topics=0,
                weak_topics=0,
                average_mastery=0.0,
                total_attempts=0,
                has_completed_diagnostic=has_attempts,
            )

        mastered = sum(1 for p in progress_records if p.mastery_score >= adaptive_config.MASTERY_STRONG_MIN)
        in_progress = sum(
            1 for p in progress_records
            if adaptive_config.MASTERY_NEEDS_IMPROVEMENT_MIN <= p.mastery_score < adaptive_config.MASTERY_STRONG_MIN
        )
        weak = sum(1 for p in progress_records if p.mastery_score < adaptive_config.MASTERY_NEEDS_IMPROVEMENT_MIN)
        total_attempts = sum(p.attempts for p in progress_records)
        avg_mastery = (
            sum(p.mastery_score for p in progress_records) / len(progress_records)
            if progress_records
            else 0.0
        )

        return OverallProgressSummary(
            total_topics=all_topics_count,
            mastered_topics=mastered,
            in_progress_topics=in_progress,
            weak_topics=weak,
            average_mastery=round(avg_mastery, 1),
            total_attempts=total_attempts,
            has_completed_diagnostic=has_attempts,
        )

    @staticmethod
    def get_subject_summaries(db: Session, student_id: int) -> List[SubjectProgressSummary]:
        subjects = subject_repo.list_with_hierarchy(db)
        progress_records = {p.topic_id: p for p in progress_repo.get_all_by_student(db, student_id)}
        results: List[SubjectProgressSummary] = []

        for sub in subjects:
            sub_topic_ids = [t.id for u in sub.units for t in u.topics if t.is_active]
            total_topics = len(sub_topic_ids)

            if total_topics == 0:
                continue

            sub_records = [progress_records[t_id] for t_id in sub_topic_ids if t_id in progress_records]

            mastered = sum(1 for p in sub_records if p.mastery_score >= adaptive_config.MASTERY_STRONG_MIN)
            moderate = sum(
                1 for p in sub_records
                if adaptive_config.MASTERY_MODERATE_MIN <= p.mastery_score < adaptive_config.MASTERY_STRONG_MIN
            )
            weak = sum(1 for p in sub_records if p.mastery_score < adaptive_config.MASTERY_NEEDS_IMPROVEMENT_MIN)

            avg = sum(p.mastery_score for p in sub_records) / total_topics if sub_records else 0.0

            results.append(
                SubjectProgressSummary(
                    subject_id=sub.id,
                    subject_name=sub.name,
                    subject_code=sub.code,
                    total_topics=total_topics,
                    mastered_topics=mastered,
                    average_mastery=round(avg, 1),
                    strong_topics_count=mastered,
                    moderate_topics_count=moderate,
                    weak_topics_count=weak,
                )
            )

        return results


progress_service = ProgressService()
