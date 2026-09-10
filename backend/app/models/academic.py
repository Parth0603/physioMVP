"""Academic hierarchy models: Subjects -> Units -> Topics."""
import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, Enum
from sqlalchemy.orm import relationship
from app.db.session import Base


class DifficultyLevel(str, enum.Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


class Subject(Base):
    __tablename__ = "subjects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, unique=True, index=True)
    code = Column(String(50), nullable=False, unique=True, index=True)
    description = Column(Text, nullable=True)
    academic_year = Column(Integer, default=1, nullable=False, index=True)
    semester = Column(Integer, default=1, nullable=False, index=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    units = relationship("Unit", back_populates="subject", cascade="all, delete-orphan", order_by="Unit.order_index")


class Unit(Base):
    __tablename__ = "units"

    id = Column(Integer, primary_key=True, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    order_index = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    subject = relationship("Subject", back_populates="units")
    topics = relationship("Topic", back_populates="unit", cascade="all, delete-orphan", order_by="Topic.order_index")


class Topic(Base):
    __tablename__ = "topics"

    id = Column(Integer, primary_key=True, index=True)
    unit_id = Column(Integer, ForeignKey("units.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    order_index = Column(Integer, default=0, nullable=False)
    difficulty_level = Column(
        Enum(DifficultyLevel, name="topic_difficulty_levels"),
        default=DifficultyLevel.BEGINNER,
        nullable=False,
    )
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    unit = relationship("Unit", back_populates="topics")
    contents = relationship("Content", back_populates="topic", cascade="all, delete-orphan")
    questions = relationship("Question", back_populates="topic", cascade="all, delete-orphan")
    clinical_cases = relationship("ClinicalCase", back_populates="topic", cascade="all, delete-orphan")
    viva_questions = relationship("VivaQuestion", back_populates="topic", cascade="all, delete-orphan")
    progress_records = relationship("StudentProgress", back_populates="topic", cascade="all, delete-orphan")
    study_plan_items = relationship("StudyPlanItem", back_populates="topic", cascade="all, delete-orphan")
