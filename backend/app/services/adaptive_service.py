"""Adaptive Learning & Gap Analysis Service.

Determines:
- "What does this student know?"
- "What does this student not know?"
- "What should this student study next?"

Strictly deterministic rule-based logic (decoupled from LLMs).
"""
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from app.core.adaptive_config import adaptive_config
from app.models.progress import StudentProgress
from app.models.academic import Topic
from app.models.content import Content, ContentType
from app.models.study_plan import StudyPlan, StudyPlanItem, PlanStatus, PlanItemStatus
from app.schemas.progress import LearningGapItem, RevisionDueItem
from app.repositories.domain import progress_repo, topic_repo, content_repo, study_plan_repo


class AdaptiveService:
    @staticmethod
    def identify_learning_gaps(db: Session, student_id: int) -> List[LearningGapItem]:
        """Rank topic learning gaps based on student mastery score and attempt history."""
        progress_records = progress_repo.get_all_by_student(db, student_id)
        gaps: List[LearningGapItem] = []

        for p in progress_records:
            topic = p.topic
            if not topic:
                continue

            # Check if this topic has a learning gap (mastery < 80%)
            if p.mastery_score < adaptive_config.MASTERY_STRONG_MIN:
                priority = adaptive_config.get_priority_level(p.mastery_score, topic.difficulty_level.value)
                priority_label = "HIGH" if priority == 1 else "MEDIUM" if priority == 2 else "LOW"
                
                if p.mastery_score < adaptive_config.PRIORITY_HIGH_THRESHOLD:
                    action = "Review core conceptual guidelines & fundamentals before retaking practice questions."
                elif p.mastery_score < adaptive_config.PRIORITY_MEDIUM_THRESHOLD:
                    action = "Targeted practice on high-yield clinical MCQs and special test vignettes."
                else:
                    action = "Light revision of applied kinesiology principles."

                subject_name = topic.unit.subject.name if topic.unit and topic.unit.subject else "General BPT"

                gaps.append(
                    LearningGapItem(
                        topic_id=topic.id,
                        topic_name=topic.name,
                        subject_name=subject_name,
                        mastery_score=round(p.mastery_score, 1),
                        attempts=p.attempts,
                        priority_level=priority,
                        priority_label=priority_label,
                        recommended_action=action,
                    )
                )

        # Sort gaps: priority 1 first (High), then ascending by mastery score (weakest first)
        gaps.sort(key=lambda x: (x.priority_level, x.mastery_score))
        return gaps

    @staticmethod
    def get_revision_due(db: Session, student_id: int) -> List[RevisionDueItem]:
        """Find topics that have reached or passed their spaced revision interval."""
        now = datetime.now(timezone.utc)
        progress_records = progress_repo.get_all_by_student(db, student_id)
        due_items: List[RevisionDueItem] = []

        for p in progress_records:
            if not p.topic:
                continue

            is_overdue = False
            if p.next_review_at:
                review_dt = p.next_review_at if p.next_review_at.tzinfo else p.next_review_at.replace(tzinfo=timezone.utc)
                if review_dt <= now:
                    is_overdue = True

            subject_name = p.topic.unit.subject.name if p.topic.unit and p.topic.unit.subject else "General BPT"

            if is_overdue or (p.mastery_score < 60 and p.attempts > 0):
                due_items.append(
                    RevisionDueItem(
                        topic_id=p.topic_id,
                        topic_name=p.topic.name,
                        subject_name=subject_name,
                        mastery_score=round(p.mastery_score, 1),
                        next_review_at=p.next_review_at,
                        is_overdue=is_overdue,
                    )
                )

        return due_items

    @staticmethod
    def calculate_next_review_date(mastery_score: float, current_attempts: int) -> datetime:
        """Calculate next spaced repetition date based on mastery band and attempt depth."""
        now = datetime.now(timezone.utc)
        band = adaptive_config.get_mastery_band(mastery_score)
        intervals = adaptive_config.SPACED_INTERVALS.get(band, [1, 3, 7])

        # Step through intervals based on attempt count
        step_idx = min(max(0, current_attempts - 1), len(intervals) - 1)
        days_ahead = intervals[step_idx]
        return now + timedelta(days=days_ahead)

    @staticmethod
    def generate_personalized_study_plan(
        db: Session, student_id: int, reason: str = "Diagnostic Assessment Gap Analysis"
    ) -> StudyPlan:
        """Generate a structured, personalized daily study plan addressing identified learning gaps.
        
        Pulls existing topic concepts and practice items from the database.
        """
        # Archive any currently active plans for this student
        existing_plans = db.query(StudyPlan).filter(
            StudyPlan.student_id == student_id, StudyPlan.status == PlanStatus.ACTIVE
        ).all()
        for ep in existing_plans:
            ep.status = PlanStatus.ARCHIVED
        db.commit()

        # Retrieve ranked gaps
        gaps = AdaptiveService.identify_learning_gaps(db, student_id)
        now = datetime.now(timezone.utc)

        # Create new study plan
        plan = StudyPlan(
            student_id=student_id,
            title="Personalized Clinical Learning & Recovery Track",
            start_date=now,
            end_date=now + timedelta(days=7),
            status=PlanStatus.ACTIVE,
            generated_reason=reason,
        )
        db.add(plan)
        db.commit()
        db.refresh(plan)

        items_created = 0
        scheduled_day_offset = 0

        # If student has identified gaps, build plan prioritizing weak topics
        if gaps:
            for gap in gaps[:adaptive_config.MAX_DAILY_PLAN_ITEMS]:
                topic_id = gap.topic_id
                item_date = now + timedelta(days=scheduled_day_offset, hours=items_created * 2)

                # 1. Concept Review Task
                concept_item = StudyPlanItem(
                    study_plan_id=plan.id,
                    topic_id=topic_id,
                    content_type=ContentType.CONCEPT,
                    scheduled_date=item_date,
                    priority=gap.priority_level,
                    status=PlanItemStatus.PENDING,
                    estimated_minutes=adaptive_config.DEFAULT_CONCEPT_MINUTES,
                )
                db.add(concept_item)

                # 2. Clinical Guideline / Practice Task
                guideline_item = StudyPlanItem(
                    study_plan_id=plan.id,
                    topic_id=topic_id,
                    content_type=ContentType.CLINICAL_GUIDELINE,
                    scheduled_date=item_date + timedelta(minutes=30),
                    priority=gap.priority_level,
                    status=PlanItemStatus.PENDING,
                    estimated_minutes=adaptive_config.DEFAULT_PRACTICE_MINUTES,
                )
                db.add(guideline_item)
                items_created += 2
        else:
            # If student has mastered everything or has no gaps, assign maintenance revision
            all_topics = db.query(Topic).filter(Topic.is_active == True).limit(2).all()
            for t in all_topics:
                item = StudyPlanItem(
                    study_plan_id=plan.id,
                    topic_id=t.id,
                    content_type=ContentType.CONCEPT,
                    scheduled_date=now + timedelta(days=1),
                    priority=3,
                    status=PlanItemStatus.PENDING,
                    estimated_minutes=20,
                )
                db.add(item)

        db.commit()
        db.refresh(plan)
        return plan


adaptive_service = AdaptiveService()
