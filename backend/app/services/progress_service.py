"""Student Progress service: mastery tracking and overview calculation."""
from typing import List, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.core.exceptions import EntityNotFoundException
from app.models.progress import StudentProgress
from app.models.academic import Topic
from app.schemas.progress import StudentProgressCreate, StudentProgressUpdate, OverallProgressSummary
from app.repositories.domain import progress_repo, topic_repo


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

        if not progress_records:
            return OverallProgressSummary(
                total_topics=all_topics_count,
                mastered_topics=0,
                in_progress_topics=0,
                average_mastery=0.0,
                total_attempts=0,
            )

        mastered = sum(1 for p in progress_records if p.mastery_score >= 80.0)
        in_progress = sum(1 for p in progress_records if 0.0 < p.mastery_score < 80.0)
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
            average_mastery=round(avg_mastery, 1),
            total_attempts=total_attempts,
        )


progress_service = ProgressService()
