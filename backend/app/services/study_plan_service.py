"""Study Plan service foundation."""
from typing import Optional
from sqlalchemy.orm import Session
from app.models.study_plan import StudyPlan, StudyPlanItem, PlanStatus
from app.schemas.study_plan import StudyPlanCreate
from app.repositories.domain import study_plan_repo


class StudyPlanService:
    @staticmethod
    def get_active_plan(db: Session, student_id: int) -> Optional[StudyPlan]:
        return study_plan_repo.get_active_by_student(db, student_id)

    @staticmethod
    def create_placeholder_plan(db: Session, student_id: int, data: StudyPlanCreate) -> StudyPlan:
        plan = StudyPlan(
            student_id=student_id,
            title=data.title,
            start_date=data.start_date,
            end_date=data.end_date,
            status=data.status or PlanStatus.ACTIVE,
            generated_reason=data.generated_reason,
        )
        db.add(plan)
        db.commit()
        db.refresh(plan)

        if data.items:
            for item in data.items:
                plan_item = StudyPlanItem(
                    study_plan_id=plan.id,
                    topic_id=item.topic_id,
                    content_type=item.content_type,
                    scheduled_date=item.scheduled_date,
                    priority=item.priority,
                    status=item.status,
                    estimated_minutes=item.estimated_minutes,
                )
                db.add(plan_item)
            db.commit()
            db.refresh(plan)

        return plan


study_plan_service = StudyPlanService()
