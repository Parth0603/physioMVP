"""Assessment questions and MCQ options models."""
import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, Enum
from sqlalchemy.orm import relationship
from app.db.session import Base
from app.models.academic import DifficultyLevel


class QuestionType(str, enum.Enum):
    MCQ = "mcq"
    SHORT_ANSWER = "short_answer"
    CLINICAL_VIGNETTE = "clinical_vignette"


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    topic_id = Column(Integer, ForeignKey("topics.id", ondelete="CASCADE"), nullable=False, index=True)
    question_text = Column(Text, nullable=False)
    question_type = Column(
        Enum(QuestionType, name="question_types"),
        default=QuestionType.MCQ,
        nullable=False,
    )
    difficulty_level = Column(
        Enum(DifficultyLevel, name="question_difficulty_levels"),
        default=DifficultyLevel.BEGINNER,
        nullable=False,
    )
    explanation = Column(Text, nullable=True)
    correct_answer = Column(String(500), nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    topic = relationship("Topic", back_populates="questions")
    options = relationship("QuestionOption", back_populates="question", cascade="all, delete-orphan")
    attempts = relationship("Attempt", back_populates="question", cascade="all, delete-orphan")


class QuestionOption(Base):
    __tablename__ = "question_options"

    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("questions.id", ondelete="CASCADE"), nullable=False, index=True)
    option_text = Column(Text, nullable=False)
    is_correct = Column(Boolean, default=False, nullable=False)

    # Relationships
    question = relationship("Question", back_populates="options")
