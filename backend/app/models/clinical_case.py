"""Clinical Cases model for clinical reasoning and vignette exercises."""
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, Enum
from sqlalchemy.orm import relationship
from app.db.session import Base
from app.models.academic import DifficultyLevel


class ClinicalCase(Base):
    __tablename__ = "clinical_cases"

    id = Column(Integer, primary_key=True, index=True)
    topic_id = Column(Integer, ForeignKey("topics.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    case_description = Column(Text, nullable=False)
    difficulty_level = Column(
        Enum(DifficultyLevel, name="clinical_case_difficulty_levels"),
        default=DifficultyLevel.INTERMEDIATE,
        nullable=False,
    )
    is_verified = Column(Boolean, default=False, nullable=False, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    topic = relationship("Topic", back_populates="clinical_cases")
