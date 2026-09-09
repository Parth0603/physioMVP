"""Curated knowledge base content model."""
import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, Enum
from sqlalchemy.orm import relationship
from app.db.session import Base
from app.models.academic import DifficultyLevel


class ContentType(str, enum.Enum):
    CONCEPT = "concept"
    EXPLANATION = "explanation"
    NOTE = "note"
    CLINICAL_GUIDELINE = "clinical_guideline"
    REFERENCE = "reference"


class Content(Base):
    __tablename__ = "content"

    id = Column(Integer, primary_key=True, index=True)
    topic_id = Column(Integer, ForeignKey("topics.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False, index=True)
    content_type = Column(
        Enum(ContentType, name="content_types"),
        default=ContentType.CONCEPT,
        nullable=False,
        index=True,
    )
    content_body = Column(Text, nullable=False)
    difficulty_level = Column(
        Enum(DifficultyLevel, name="content_difficulty_levels"),
        default=DifficultyLevel.BEGINNER,
        nullable=False,
    )
    reference = Column(String(500), nullable=True)  # source book, author, journal citation
    is_verified = Column(Boolean, default=False, nullable=False, index=True)  # verified by faculty
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    topic = relationship("Topic", back_populates="contents")
