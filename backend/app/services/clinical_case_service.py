"""Clinical Case reasoning service: retrieval, deterministic rubric evaluation, and mastery updating."""
import json
import re
from typing import List, Optional
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from app.core.exceptions import EntityNotFoundException
from app.models.clinical_case import ClinicalCase
from app.models.academic import Topic
from app.models.progress import StudentProgress
from app.models.study_plan import StudyPlanItem, PlanItemStatus
from app.schemas.clinical_case import (
    ClinicalCaseResponse,
    ClinicalCaseSubmissionRequest,
    ClinicalCaseResultResponse,
    StageFeedback,
)


def _match_points(text: str, expected_points: List[str]) -> (List[str], List[str], int):
    """Deterministic keyword & semantic point matching without external AI dependencies."""
    text_lower = text.lower()
    identified = []
    missed = []

    for pt in expected_points:
        words = [w.lower() for w in re.findall(r'\b\w{3,}\b', pt)]
        # If at least 40% of significant words in the key concept appear in the response, count as identified
        matches = sum(1 for w in words if w in text_lower)
        if words and (matches / len(words)) >= 0.35:
            identified.append(pt)
        else:
            missed.append(pt)

    score = round((len(identified) / len(expected_points)) * 100) if expected_points else 100
    return identified, missed, score


class ClinicalCaseService:
    @staticmethod
    def list_cases(db: Session, topic_id: Optional[int] = None) -> List[ClinicalCaseResponse]:
        query = db.query(ClinicalCase).filter(ClinicalCase.is_verified == True)
        if topic_id:
            query = query.filter(ClinicalCase.topic_id == topic_id)
        cases = query.all()

        results = []
        for c in cases:
            res = ClinicalCaseResponse.model_validate(c)
            res.topic_name = c.topic.name if c.topic else f"Topic #{c.topic_id}"
            results.append(res)
        return results

    @staticmethod
    def get_case(db: Session, case_id: int) -> ClinicalCaseResponse:
        c = db.query(ClinicalCase).filter(ClinicalCase.id == case_id).first()
        if not c:
            raise EntityNotFoundException("ClinicalCase", case_id)
        res = ClinicalCaseResponse.model_validate(c)
        res.topic_name = c.topic.name if c.topic else f"Topic #{c.topic_id}"
        return res

    @staticmethod
    def evaluate_case(
        db: Session, student_id: int, case_id: int, submission: ClinicalCaseSubmissionRequest
    ) -> ClinicalCaseResultResponse:
        case = db.query(ClinicalCase).filter(ClinicalCase.id == case_id).first()
        if not case:
            raise EntityNotFoundException("ClinicalCase", case_id)

        # Parse expectations or use defaults
        def parse_points(field_value: Optional[str], default_points: List[str]) -> List[str]:
            if not field_value:
                return default_points
            try:
                parsed = json.loads(field_value)
                if isinstance(parsed, list):
                    return parsed
            except Exception:
                pass
            return [p.strip() for p in field_value.split(';') if p.strip()] or default_points

        hypo_expected = parse_points(
            case.expected_hypothesis,
            ["Subacromial impingement", "Supraspinatus tendinopathy", "Rotator cuff pathology", "Painful arc syndrome"],
        )
        assess_expected = parse_points(
            case.expected_assessments,
            ["Neer test", "Hawkins-Kennedy impingement test", "Empty Can test (Jobe's)", "Scapular dyskinesis check"],
        )
        mgmt_expected = parse_points(
            case.expected_management,
            ["Relative rest & activity modification", "Rotator cuff isometric strengthening", "Scapular stabilization exercises", "Cryotherapy or modalities for pain relief"],
        )

        hypo_id, hypo_ms, hypo_sc = _match_points(submission.hypothesis, hypo_expected)
        assess_id, assess_ms, assess_sc = _match_points(submission.assessments, assess_expected)
        mgmt_id, mgmt_ms, mgmt_sc = _match_points(submission.management, mgmt_expected)

        # Weighted overall score (Hypothesis 35%, Assessment 35%, Management 30%)
        overall = round(hypo_sc * 0.35 + assess_sc * 0.35 + mgmt_sc * 0.30)

        # Update StudentProgress deterministically
        progress = db.query(StudentProgress).filter(
            StudentProgress.student_id == student_id,
            StudentProgress.topic_id == case.topic_id,
        ).first()

        now = datetime.now(timezone.utc)
        if not progress:
            progress = StudentProgress(
                student_id=student_id,
                topic_id=case.topic_id,
                mastery_score=float(overall),
                attempts=1,
                correct_attempts=1 if overall >= 60 else 0,
                last_attempt_at=now,
                next_review_at=now + timedelta(days=2 if overall < 60 else 4),
            )
            db.add(progress)
        else:
            progress.attempts += 1
            if overall >= 60:
                progress.correct_attempts += 1
            # Blend new case reasoning score into mastery score
            progress.mastery_score = round(progress.mastery_score * 0.7 + float(overall) * 0.3, 1)
            progress.last_attempt_at = now
            progress.next_review_at = now + timedelta(days=2 if progress.mastery_score < 60 else 4)

        # Mark corresponding study plan item as completed if pending
        plan_item = db.query(StudyPlanItem).filter(
            StudyPlanItem.topic_id == case.topic_id,
            StudyPlanItem.status == PlanItemStatus.PENDING,
        ).first()
        if plan_item:
            plan_item.status = PlanItemStatus.COMPLETED

        db.commit()
        db.refresh(progress)

        # Generate rule-based feedback
        if overall >= 75:
            rec = f"Excellent clinical reasoning! You demonstrated sound differential diagnosis and rehabilitation planning for {case.topic.name if case.topic else 'this condition'}."
        elif overall >= 50:
            missed_summary = ", ".join((hypo_ms + assess_ms)[:2])
            rec = f"Moderate reasoning performance. Review special clinical tests and specific criteria: {missed_summary}."
        else:
            rec = f"Needs reinforcement. Key clinical indicators and assessment protocols were missed. Review the foundational anatomy and diagnostic tests for {case.topic.name if case.topic else 'this topic'}."

        return ClinicalCaseResultResponse(
            case_id=case.id,
            overall_score=overall,
            hypothesis_feedback=StageFeedback(score=hypo_sc, points_identified=hypo_id, points_missed=hypo_ms),
            assessment_feedback=StageFeedback(score=assess_sc, points_identified=assess_id, points_missed=assess_ms),
            management_feedback=StageFeedback(score=mgmt_sc, points_identified=mgmt_id, points_missed=mgmt_ms),
            learning_recommendation=rec,
            topic_id=case.topic_id,
            new_mastery_score=progress.mastery_score,
        )


clinical_case_service = ClinicalCaseService()
