"""Study Plan schemas for personalized planning."""
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel
from app.models.study_plan import PlanStatus, PlanItemStatus
from app.models.content import ContentType
from app.schemas.academic import TopicResponse


class StudyPlanItemBase(BaseModel):
    topic_id: int
    content_type: ContentType = ContentType.CONCEPT
    scheduled_date: Optional[datetime] = None
    priority: int = 1
    status: PlanItemStatus = PlanItemStatus.PENDING
    estimated_minutes: int = 30


class StudyPlanItemCreate(StudyPlanItemBase):
    pass


class StudyPlanItemResponse(StudyPlanItemBase):
    id: int
    study_plan_id: int
    topic: Optional[TopicResponse] = None

    class Config:
        from_attributes = True


class StudyPlanBase(BaseModel):
    title: str
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    status: PlanStatus = PlanStatus.ACTIVE
    generated_reason: Optional[str] = None


class StudyPlanCreate(StudyPlanBase):
    items: Optional[List[StudyPlanItemCreate]] = []


class StudyPlanResponse(StudyPlanBase):
    id: int
    student_id: int
    created_at: datetime
    updated_at: datetime
    items: List[StudyPlanItemResponse] = []

    class Config:
        from_attributes = True
