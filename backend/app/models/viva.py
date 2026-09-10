"""Viva Voce question model for clinical oral exams and keyword-based evaluation."""
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, Enum
from sqlalchemy.orm import relationship
from app.db.session import Base
from app.models.academic import DifficultyLevel


class VivaQuestion(Base):
    __tablename__ = "viva_questions"

    id = Column(Integer, primary_key=True, index=True)
    topic_id = Column(Integer, ForeignKey("topics.id", ondelete="CASCADE"), nullable=False, index=True)
    question_text = Column(Text, nullable=False)
    expected_concepts = Column(Text, nullable=False)  # JSON-encoded array of keyword concepts
    model_answer = Column(Text, nullable=False)
    explanation = Column(Text, nullable=True)
    difficulty_level = Column(
        Enum(DifficultyLevel, name="viva_difficulty_levels"),
        default=DifficultyLevel.BEGINNER,
        nullable=False,
    )
    is_verified = Column(Boolean, default=True, nullable=False, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    topic = relationship("Topic", back_populates="viva_questions")
