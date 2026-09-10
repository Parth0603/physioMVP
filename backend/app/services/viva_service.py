"""Viva Voce service: oral exam questions, keyword evaluation, and mastery updating."""
import json
import re
from typing import List, Optional
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from app.core.exceptions import EntityNotFoundException
from app.models.viva import VivaQuestion
from app.models.academic import Topic
from app.models.progress import StudentProgress
from app.models.study_plan import StudyPlanItem, PlanItemStatus
from app.schemas.viva import VivaQuestionResponse, VivaEvaluationResponse


class VivaService:
    @staticmethod
    def list_viva_questions(db: Session, topic_id: int) -> List[VivaQuestionResponse]:
        questions = db.query(VivaQuestion).filter(
            VivaQuestion.topic_id == topic_id,
            VivaQuestion.is_verified == True,
        ).all()

        results = []
        for q in questions:
            concepts = []
            try:
                concepts = json.loads(q.expected_concepts)
            except Exception:
                concepts = [c.strip() for c in q.expected_concepts.split(",") if c.strip()]

            res = VivaQuestionResponse(
                id=q.id,
                topic_id=q.topic_id,
                question_text=q.question_text,
                expected_concepts=concepts,
                model_answer=q.model_answer,
                explanation=q.explanation,
                difficulty_level=q.difficulty_level,
                is_verified=q.is_verified,
                created_at=q.created_at,
                topic_name=q.topic.name if q.topic else f"Topic #{q.topic_id}",
            )
            results.append(res)
        return results

    @staticmethod
    def evaluate_viva(
        db: Session, student_id: int, question_id: int, answer_text: str
    ) -> VivaEvaluationResponse:
        q = db.query(VivaQuestion).filter(VivaQuestion.id == question_id).first()
        if not q:
            raise EntityNotFoundException("VivaQuestion", question_id)

        concepts = []
        try:
            concepts = json.loads(q.expected_concepts)
        except Exception:
            concepts = [c.strip() for c in q.expected_concepts.split(",") if c.strip()]

        ans_lower = answer_text.lower()
        identified = []
        missed = []

        for c in concepts:
            words = [w.lower() for w in re.findall(r'\b\w{3,}\b', c)]
            # If at least 40% of words in the concept appear in student's answer
            match_count = sum(1 for w in words if w in ans_lower)
            if words and (match_count / len(words)) >= 0.35:
                identified.append(c)
            else:
                missed.append(c)

        score = round((len(identified) / len(concepts)) * 100) if concepts else 100

        # Update StudentProgress in database
        now = datetime.now(timezone.utc)
        progress = db.query(StudentProgress).filter(
            StudentProgress.student_id == student_id,
            StudentProgress.topic_id == q.topic_id,
        ).first()

        if not progress:
            progress = StudentProgress(
                student_id=student_id,
                topic_id=q.topic_id,
                mastery_score=float(score),
                attempts=1,
                correct_attempts=1 if score >= 60 else 0,
                last_attempt_at=now,
                next_review_at=now + timedelta(days=2 if score < 60 else 4),
            )
            db.add(progress)
        else:
            progress.attempts += 1
            if score >= 60:
                progress.correct_attempts += 1
            # Blend viva performance into mastery score
            progress.mastery_score = round(progress.mastery_score * 0.75 + float(score) * 0.25, 1)
            progress.last_attempt_at = now
            progress.next_review_at = now + timedelta(days=2 if progress.mastery_score < 60 else 4)

        # Mark any pending study plan item for this topic
        plan_item = db.query(StudyPlanItem).filter(
            StudyPlanItem.topic_id == q.topic_id,
            StudyPlanItem.status == PlanItemStatus.PENDING,
        ).first()
        if plan_item:
            plan_item.status = PlanItemStatus.COMPLETED

        db.commit()
        db.refresh(progress)

        if score >= 80:
            revision_tip = "Strong conceptual articulation! You successfully covered all critical anatomical and clinical points."
        elif score >= 50:
            revision_tip = f"Good grasp of the core principle, but make sure to explicitly cite: {', '.join(missed[:2])} during oral clinical examinations."
        else:
            revision_tip = f"Incomplete explanation. Key anatomical terms were missing ({', '.join(missed)}). Review the model answer and practice vocalizing the points."

        feedback_msg = (
            f"You identified {len(identified)} key concept(s) but missed {len(missed)} expected clinical point(s)."
            if missed
            else f"Excellent! You identified all {len(identified)} key clinical and physiological concepts."
        )

        return VivaEvaluationResponse(
            question_id=q.id,
            score=score,
            key_concepts_identified=identified,
            concepts_missed=missed,
            feedback=feedback_msg,
            suggested_revision=revision_tip,
            model_answer=q.model_answer,
            topic_id=q.topic_id,
            new_mastery_score=progress.mastery_score,
        )


viva_service = VivaService()
