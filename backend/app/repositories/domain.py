"""Domain-specific repositories."""
from typing import Optional, List
from sqlalchemy.orm import Session, joinedload
from app.repositories.base import BaseRepository
from app.models.user import User
from app.models.student_profile import StudentProfile
from app.models.academic import Subject, Unit, Topic
from app.models.content import Content
from app.models.question import Question, QuestionOption
from app.models.progress import StudentProgress
from app.models.study_plan import StudyPlan
from app.models.assessment import Assessment, AssessmentQuestion
from app.models.attempt import Attempt


class UserRepository(BaseRepository[User]):
    def __init__(self):
        super().__init__(User)

    def get_by_email(self, db: Session, email: str) -> Optional[User]:
        return db.query(User).filter(User.email == email).first()

    def get_with_profile(self, db: Session, user_id: int) -> Optional[User]:
        return (
            db.query(User)
            .options(
                joinedload(User.student_profile),
                joinedload(User.faculty_profile),
                joinedload(User.admin_profile),
            )
            .filter(User.id == user_id)
            .first()
        )


class SubjectRepository(BaseRepository[Subject]):
    def __init__(self):
        super().__init__(Subject)

    def get_by_code(self, db: Session, code: str) -> Optional[Subject]:
        return db.query(Subject).filter(Subject.code == code).first()

    def get_with_hierarchy(self, db: Session, subject_id: int) -> Optional[Subject]:
        return (
            db.query(Subject)
            .options(joinedload(Subject.units).joinedload(Unit.topics))
            .filter(Subject.id == subject_id)
            .first()
        )

    def list_with_hierarchy(self, db: Session) -> List[Subject]:
        return (
            db.query(Subject)
            .options(joinedload(Subject.units).joinedload(Unit.topics))
            .order_by(Subject.academic_year, Subject.semester, Subject.name)
            .all()
        )


class UnitRepository(BaseRepository[Unit]):
    def __init__(self):
        super().__init__(Unit)

    def get_by_subject(self, db: Session, subject_id: int) -> List[Unit]:
        return (
            db.query(Unit)
            .filter(Unit.subject_id == subject_id)
            .order_by(Unit.order_index)
            .all()
        )


class TopicRepository(BaseRepository[Topic]):
    def __init__(self):
        super().__init__(Topic)

    def get_by_unit(self, db: Session, unit_id: int) -> List[Topic]:
        return (
            db.query(Topic)
            .filter(Topic.unit_id == unit_id)
            .order_by(Topic.order_index)
            .all()
        )


class ContentRepository(BaseRepository[Content]):
    def __init__(self):
        super().__init__(Content)

    def get_by_topic(self, db: Session, topic_id: int) -> List[Content]:
        return (
            db.query(Content)
            .filter(Content.topic_id == topic_id)
            .order_by(Content.created_at)
            .all()
        )

    def get_verified_by_topic(self, db: Session, topic_id: int) -> List[Content]:
        return (
            db.query(Content)
            .filter(Content.topic_id == topic_id, Content.is_verified == True)
            .order_by(Content.created_at)
            .all()
        )


class QuestionRepository(BaseRepository[Question]):
    def __init__(self):
        super().__init__(Question)

    def get_by_topic(self, db: Session, topic_id: int) -> List[Question]:
        return (
            db.query(Question)
            .options(joinedload(Question.options))
            .filter(Question.topic_id == topic_id)
            .all()
        )

    def get_with_options(self, db: Session, question_id: int) -> Optional[Question]:
        return (
            db.query(Question)
            .options(joinedload(Question.options), joinedload(Question.topic))
            .filter(Question.id == question_id)
            .first()
        )

    def list_all(self, db: Session, skip: int = 0, limit: int = 100, topic_id: Optional[int] = None) -> List[Question]:
        query = db.query(Question).options(joinedload(Question.options), joinedload(Question.topic))
        if topic_id:
            query = query.filter(Question.topic_id == topic_id)
        return query.offset(skip).limit(limit).all()


class ProgressRepository(BaseRepository[StudentProgress]):
    def __init__(self):
        super().__init__(StudentProgress)

    def get_by_student_and_topic(
        self, db: Session, student_id: int, topic_id: int
    ) -> Optional[StudentProgress]:
        return (
            db.query(StudentProgress)
            .filter(
                StudentProgress.student_id == student_id,
                StudentProgress.topic_id == topic_id,
            )
            .first()
        )

    def get_all_by_student(self, db: Session, student_id: int) -> List[StudentProgress]:
        return (
            db.query(StudentProgress)
            .options(
                joinedload(StudentProgress.topic).joinedload(Topic.unit).joinedload(Unit.subject)
            )
            .filter(StudentProgress.student_id == student_id)
            .all()
        )


class StudyPlanRepository(BaseRepository[StudyPlan]):
    def __init__(self):
        super().__init__(StudyPlan)

    def get_active_by_student(self, db: Session, student_id: int) -> Optional[StudyPlan]:
        return (
            db.query(StudyPlan)
            .options(
                joinedload(StudyPlan.items).joinedload(StudyPlan.items.property.mapper.class_.topic)
            )
            .filter(StudyPlan.student_id == student_id)
            .order_by(StudyPlan.created_at.desc())
            .first()
        )


class AssessmentRepository(BaseRepository[Assessment]):
    def __init__(self):
        super().__init__(Assessment)

    def list_active(self, db: Session, subject_id: Optional[int] = None) -> List[Assessment]:
        query = db.query(Assessment).filter(Assessment.is_active == True)
        if subject_id:
            query = query.filter(Assessment.subject_id == subject_id)
        return query.order_by(Assessment.created_at.desc()).all()

    def get_with_questions(self, db: Session, assessment_id: int) -> Optional[Assessment]:
        return (
            db.query(Assessment)
            .options(
                joinedload(Assessment.assessment_questions)
                .joinedload(AssessmentQuestion.question)
                .joinedload(Question.options),
                joinedload(Assessment.assessment_questions)
                .joinedload(AssessmentQuestion.question)
                .joinedload(Question.topic),
            )
            .filter(Assessment.id == assessment_id)
            .first()
        )


class AttemptRepository(BaseRepository[Attempt]):
    def __init__(self):
        super().__init__(Attempt)

    def get_by_student(self, db: Session, student_id: int, limit: int = 50) -> List[Attempt]:
        return (
            db.query(Attempt)
            .options(joinedload(Attempt.question).joinedload(Question.topic))
            .filter(Attempt.student_id == student_id)
            .order_by(Attempt.attempted_at.desc())
            .limit(limit)
            .all()
        )


# Instances
user_repo = UserRepository()
subject_repo = SubjectRepository()
unit_repo = UnitRepository()
topic_repo = TopicRepository()
content_repo = ContentRepository()
question_repo = QuestionRepository()
progress_repo = ProgressRepository()
study_plan_repo = StudyPlanRepository()
assessment_repo = AssessmentRepository()
attempt_repo = AttemptRepository()
