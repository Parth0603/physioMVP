"""Student Progress model tracking mastery and spaced review."""
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.db.session import Base


class StudentProgress(Base):
    __tablename__ = "student_progress"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    topic_id = Column(Integer, ForeignKey("topics.id", ondelete="CASCADE"), nullable=False, index=True)
    mastery_score = Column(Float, default=0.0, nullable=False)  # 0.0 to 100.0%
    attempts = Column(Integer, default=0, nullable=False)
    correct_attempts = Column(Integer, default=0, nullable=False)
    confidence_score = Column(Float, default=0.0, nullable=False)  # Self-reported or calculated 0.0-1.0
    last_attempt_at = Column(DateTime, nullable=True)
    next_review_at = Column(DateTime, nullable=True)  # Spaced repetition target date
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    __table_args__ = (
        UniqueConstraint("student_id", "topic_id", name="uq_student_topic_progress"),
    )

    # Relationships
    student = relationship("User", back_populates="progress_records")
    topic = relationship("Topic", back_populates="progress_records")
