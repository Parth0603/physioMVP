"""Assessment Service: diagnostic test generation, test-taking, scoring, and mastery updating."""
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.core.exceptions import EntityNotFoundException, PhysioSmartException
from app.core.adaptive_config import adaptive_config
from app.models.assessment import Assessment, AssessmentQuestion, AssessmentType
from app.models.question import Question, QuestionOption
from app.models.attempt import Attempt
from app.models.progress import StudentProgress
from app.models.academic import Topic, Subject
from app.schemas.assessment import (
    AssessmentCreate,
    AssessmentResponse,
    AssessmentStartResponse,
    QuestionForTest,
    OptionForTest,
    AssessmentSubmitRequest,
    AssessmentResultResponse,
    TopicPerformance,
)
from app.repositories.domain import (
    assessment_repo,
    question_repo,
    progress_repo,
    topic_repo,
    subject_repo,
)
from app.services.adaptive_service import adaptive_service


class AssessmentService:
    @staticmethod
    def list_assessments(db: Session, subject_id: Optional[int] = None) -> List[AssessmentResponse]:
        assessments = assessment_repo.list_active(db, subject_id)
        results = []
        for a in assessments:
            q_count = len(a.assessment_questions) if a.assessment_questions else 0
            res = AssessmentResponse(
                id=a.id,
                title=a.title,
                description=a.description,
                subject_id=a.subject_id,
                assessment_type=a.assessment_type,
                duration_minutes=a.duration_minutes,
                is_active=a.is_active,
                created_at=a.created_at,
                question_count=q_count,
            )
            results.append(res)
        return results

    @staticmethod
    def get_assessment(db: Session, assessment_id: int) -> Assessment:
        assessment = assessment_repo.get_with_questions(db, assessment_id)
        if not assessment:
            raise EntityNotFoundException("Assessment", assessment_id)
        return assessment

    @staticmethod
    def create_assessment(db: Session, data: AssessmentCreate) -> Assessment:
        assessment = Assessment(
            title=data.title,
            description=data.description,
            subject_id=data.subject_id,
            assessment_type=data.assessment_type,
            duration_minutes=data.duration_minutes,
            is_active=data.is_active,
        )
        db.add(assessment)
        db.commit()
        db.refresh(assessment)

        if data.question_ids:
            for idx, q_id in enumerate(data.question_ids, start=1):
                aq = AssessmentQuestion(
                    assessment_id=assessment.id,
                    question_id=q_id,
                    order_index=idx,
                )
                db.add(aq)
            db.commit()
            db.refresh(assessment)

        return assessment

    @staticmethod
    def start_assessment(db: Session, assessment_id: int) -> AssessmentStartResponse:
        """Fetch assessment questions with correct answers masked for clean test-taking."""
        assessment = assessment_repo.get_with_questions(db, assessment_id)
        if not assessment:
            raise EntityNotFoundException("Assessment", assessment_id)

        questions_for_test: List[QuestionForTest] = []
        for aq in assessment.assessment_questions:
            q = aq.question
            if not q:
                continue

            options_for_test = [
                OptionForTest(id=opt.id, option_text=opt.option_text)
                for opt in q.options
            ]

            questions_for_test.append(
                QuestionForTest(
                    id=q.id,
                    topic_id=q.topic_id,
                    topic_name=q.topic.name if q.topic else f"Topic #{q.topic_id}",
                    question_text=q.question_text,
                    question_type=q.question_type.value,
                    difficulty_level=q.difficulty_level.value,
                    options=options_for_test,
                )
            )

        if not questions_for_test:
            raise PhysioSmartException(
                status_code=400,
                detail="This assessment does not contain any questions yet. Please check back soon.",
            )

        return AssessmentStartResponse(
            assessment_id=assessment.id,
            title=assessment.title,
            description=assessment.description,
            duration_minutes=assessment.duration_minutes,
            total_questions=len(questions_for_test),
            questions=questions_for_test,
        )

    @staticmethod
    def submit_assessment(
        db: Session, student_id: int, assessment_id: int, req: AssessmentSubmitRequest
    ) -> AssessmentResultResponse:
        """Grade submitted answers, record attempts, update topic mastery, and trigger adaptive plan."""
        assessment = assessment_repo.get_with_questions(db, assessment_id)
        if not assessment:
            raise EntityNotFoundException("Assessment", assessment_id)

        # Map questions for fast lookup
        questions_map = {aq.question_id: aq.question for aq in assessment.assessment_questions if aq.question}

        # Topic aggregation containers
        topic_stats: Dict[int, Dict[str, Any]] = {}
        total_correct = 0
        total_time = 0

        now = datetime.now(timezone.utc)

        # Evaluate each submitted answer
        for answer_sub in req.answers:
            q = questions_map.get(answer_sub.question_id)
            if not q:
                continue

            is_correct = (answer_sub.selected_option_text.strip() == q.correct_answer.strip())
            if is_correct:
                total_correct += 1

            total_time += answer_sub.time_taken_seconds

            # Record Attempt entity
            attempt = Attempt(
                student_id=student_id,
                question_id=q.id,
                assessment_id=assessment_id,
                answer=answer_sub.selected_option_text,
                is_correct=is_correct,
                time_taken=answer_sub.time_taken_seconds,
                attempted_at=now,
            )
            db.add(attempt)

            # Aggregate by topic
            t_id = q.topic_id
            if t_id not in topic_stats:
                topic_stats[t_id] = {
                    "topic_name": q.topic.name if q.topic else f"Topic #{t_id}",
                    "difficulty": q.topic.difficulty_level.value if q.topic else "beginner",
                    "total": 0,
                    "correct": 0,
                }
            topic_stats[t_id]["total"] += 1
            if is_correct:
                topic_stats[t_id]["correct"] += 1

        db.commit()

        # Update StudentProgress for every evaluated topic
        topic_performances: List[TopicPerformance] = []
        strong_areas: List[str] = []
        weak_areas: List[str] = []
        recommended_focus: List[str] = []

        for t_id, stats in topic_stats.items():
            acc_pct = (stats["correct"] / stats["total"]) * 100.0 if stats["total"] > 0 else 0.0

            # Get existing progress or initialize
            prog = progress_repo.get_by_student_and_topic(db, student_id, t_id)
            score_before = prog.mastery_score if prog else 0.0

            if not prog:
                # First time mastery score is based directly on this assessment accuracy
                new_mastery = acc_pct
                prog = StudentProgress(
                    student_id=student_id,
                    topic_id=t_id,
                    mastery_score=round(new_mastery, 1),
                    attempts=stats["total"],
                    correct_attempts=stats["correct"],
                    confidence_score=round(acc_pct / 100.0, 2),
                    last_attempt_at=now,
                    next_review_at=adaptive_service.calculate_next_review_date(new_mastery, 1),
                )
                db.add(prog)
            else:
                # Cumulative moving weighted update: 60% historical + 40% recent test
                prog.attempts += stats["total"]
                prog.correct_attempts += stats["correct"]
                new_mastery = (prog.mastery_score * 0.60) + (acc_pct * 0.40)
                prog.mastery_score = round(new_mastery, 1)
                prog.last_attempt_at = now
                prog.next_review_at = adaptive_service.calculate_next_review_date(new_mastery, prog.attempts)

            db.commit()
            db.refresh(prog)

            band = adaptive_config.get_mastery_band(prog.mastery_score)
            priority = adaptive_config.get_priority_level(prog.mastery_score, stats["difficulty"])

            if prog.mastery_score >= adaptive_config.MASTERY_STRONG_MIN:
                strong_areas.append(stats["topic_name"])
            else:
                weak_areas.append(stats["topic_name"])
                if priority <= 2:
                    recommended_focus.append(stats["topic_name"])

            topic_performances.append(
                TopicPerformance(
                    topic_id=t_id,
                    topic_name=stats["topic_name"],
                    total_questions=stats["total"],
                    correct_count=stats["correct"],
                    accuracy_percentage=round(acc_pct, 1),
                    mastery_score_before=round(score_before, 1),
                    mastery_score_after=round(prog.mastery_score, 1),
                    mastery_band=band,
                    priority_level=priority,
                )
            )

        # Deterministically generate updated study plan addressing these gaps
        study_plan = adaptive_service.generate_personalized_study_plan(
            db, student_id, reason=f"Assessment: {assessment.title}"
        )

        overall_acc = (total_correct / len(req.answers)) * 100.0 if req.answers else 0.0

        return AssessmentResultResponse(
            assessment_id=assessment.id,
            assessment_title=assessment.title,
            total_questions=len(req.answers),
            correct_answers=total_correct,
            incorrect_answers=len(req.answers) - total_correct,
            accuracy_percentage=round(overall_acc, 1),
            total_time_seconds=total_time,
            topic_performances=topic_performances,
            strong_areas=strong_areas,
            weak_areas=weak_areas,
            recommended_focus=recommended_focus,
            study_plan_id=study_plan.id if study_plan else None,
        )


assessment_service = AssessmentService()
