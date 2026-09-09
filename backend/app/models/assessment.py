"""Assessment and AssessmentQuestion models for diagnostic and topic practice tests."""
import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, Enum
from sqlalchemy.orm import relationship
from app.db.session import Base


class AssessmentType(str, enum.Enum):
    DIAGNOSTIC = "diagnostic"
    TOPIC_PRACTICE = "topic_practice"
    SUBJECT_REVIEW = "subject_review"


class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id", ondelete="CASCADE"), nullable=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    assessment_type = Column(
        Enum(AssessmentType, name="assessment_types"),
        default=AssessmentType.DIAGNOSTIC,
        nullable=False,
    )
    duration_minutes = Column(Integer, default=30, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    subject = relationship("Subject")
    assessment_questions = relationship(
        "AssessmentQuestion",
        back_populates="assessment",
        cascade="all, delete-orphan",
        order_by="AssessmentQuestion.order_index",
    )
    attempts = relationship("Attempt", back_populates="assessment")


class AssessmentQuestion(Base):
    __tablename__ = "assessment_questions"

    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False, index=True)
    question_id = Column(Integer, ForeignKey("questions.id", ondelete="CASCADE"), nullable=False, index=True)
    order_index = Column(Integer, default=1, nullable=False)

    # Relationships
    assessment = relationship("Assessment", back_populates="assessment_questions")
    question = relationship("Question")
