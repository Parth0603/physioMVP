"""Study plan and study plan items for personalized learning tracks."""
import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from app.db.session import Base
from app.models.content import ContentType


class PlanStatus(str, enum.Enum):
    PENDING = "pending"
    ACTIVE = "active"
    COMPLETED = "completed"
    ARCHIVED = "archived"


class PlanItemStatus(str, enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    SKIPPED = "skipped"


class StudyPlan(Base):
    __tablename__ = "study_plans"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    status = Column(Enum(PlanStatus, name="study_plan_statuses"), default=PlanStatus.ACTIVE, nullable=False)
    generated_reason = Column(Text, nullable=True)  # e.g., "Initial Diagnostic Assessment Gap Analysis"
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    student = relationship("User", back_populates="study_plans")
    items = relationship("StudyPlanItem", back_populates="study_plan", cascade="all, delete-orphan", order_by="StudyPlanItem.scheduled_date")


class StudyPlanItem(Base):
    __tablename__ = "study_plan_items"

    id = Column(Integer, primary_key=True, index=True)
    study_plan_id = Column(Integer, ForeignKey("study_plans.id", ondelete="CASCADE"), nullable=False, index=True)
    topic_id = Column(Integer, ForeignKey("topics.id", ondelete="CASCADE"), nullable=False, index=True)
    content_type = Column(Enum(ContentType, name="plan_content_types"), default=ContentType.CONCEPT, nullable=False)
    scheduled_date = Column(DateTime, nullable=True)
    priority = Column(Integer, default=1, nullable=False)  # 1 (Highest) to 5 (Lowest)
    status = Column(Enum(PlanItemStatus, name="plan_item_statuses"), default=PlanItemStatus.PENDING, nullable=False)
    estimated_minutes = Column(Integer, default=30, nullable=False)

    # Relationships
    study_plan = relationship("StudyPlan", back_populates="items")
    topic = relationship("Topic", back_populates="study_plan_items")
