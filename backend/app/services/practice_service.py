"""MCQ Practice service: topic question practice, attempt recording, and mastery updates."""
from typing import List, Optional
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from app.core.exceptions import EntityNotFoundException
from app.models.question import Question, QuestionOption, QuestionType
from app.models.attempt import Attempt
from app.models.progress import StudentProgress
from app.models.study_plan import StudyPlanItem, PlanItemStatus
from app.schemas.question import QuestionResponse
from app.schemas.practice import MCQPracticeSubmitRequest, MCQPracticeResultResponse


class PracticeService:
    @staticmethod
    def get_topic_mcqs(db: Session, topic_id: int) -> List[QuestionResponse]:
        questions = db.query(Question).filter(
            Question.topic_id == topic_id,
            Question.question_type == QuestionType.MCQ,
            Question.is_verified == True,
        ).all()
        return [QuestionResponse.model_validate(q) for q in questions]

    @staticmethod
    def submit_topic_mcqs(
        db: Session, student_id: int, topic_id: int, req: MCQPracticeSubmitRequest
    ) -> MCQPracticeResultResponse:
        total = len(req.answers)
        correct_count = 0
        now = datetime.now(timezone.utc)

        for ans in req.answers:
            q = db.query(Question).filter(Question.id == ans.question_id).first()
            if not q:
                continue

            if ans.selected_option_id:
                opt = db.query(QuestionOption).filter(QuestionOption.id == ans.selected_option_id).first()
                is_correct = opt.is_correct if opt else False
                answer_str = opt.option_text if opt else ""
            else:
                answer_str = ans.answer or ""
                is_correct = (answer_str.strip().lower() == q.correct_answer.strip().lower())

            if is_correct:
                correct_count += 1

            # Save in existing ATTEMPTS table
            attempt = Attempt(
                student_id=student_id,
                question_id=q.id,
                assessment_id=None,  # Standalone practice attempt
                answer=answer_str,
                is_correct=is_correct,
                time_taken=ans.time_taken_seconds,
                attempted_at=now,
            )
            db.add(attempt)

        accuracy = round((correct_count / total) * 100, 1) if total > 0 else 0.0

        # Update StudentProgress deterministically
        progress = db.query(StudentProgress).filter(
            StudentProgress.student_id == student_id,
            StudentProgress.topic_id == topic_id,
        ).first()

        if not progress:
            progress = StudentProgress(
                student_id=student_id,
                topic_id=topic_id,
                mastery_score=accuracy,
                attempts=total,
                correct_attempts=correct_count,
                last_attempt_at=now,
                next_review_at=now + timedelta(days=2 if accuracy < 70 else 5),
            )
            db.add(progress)
        else:
            progress.attempts += total
            progress.correct_attempts += correct_count
            # Rolling average weighted update
            progress.mastery_score = round(
                (progress.correct_attempts / progress.attempts) * 100, 1
            ) if progress.attempts > 0 else accuracy
            progress.last_attempt_at = now
            progress.next_review_at = now + timedelta(days=2 if progress.mastery_score < 70 else 5)

        # Mark any pending study plan items for this topic as completed
        plan_item = db.query(StudyPlanItem).filter(
            StudyPlanItem.topic_id == topic_id,
            StudyPlanItem.status == PlanItemStatus.PENDING,
        ).first()
        if plan_item:
            plan_item.status = PlanItemStatus.COMPLETED

        db.commit()
        db.refresh(progress)

        # Banding & recommendation
        if accuracy >= 75:
            band = "Strong"
            rec = "Good performance! You have demonstrated solid command over this topic's concepts. Continue to the next topic or try Viva practice."
        elif accuracy >= 50:
            band = "Needs Improvement"
            rec = "Moderate accuracy. Review the clinical explanations for missed questions before moving forward."
        else:
            band = "Weak"
            rec = "Review this topic before attempting another assessment. Focus on the foundational concepts and muscle innervations."

        return MCQPracticeResultResponse(
            topic_id=topic_id,
            total_questions=total,
            attempted=total,
            correct_count=correct_count,
            incorrect_count=total - correct_count,
            accuracy=accuracy,
            performance_band=band,
            recommended_action=rec,
            new_mastery_score=progress.mastery_score,
        )


practice_service = PracticeService()
