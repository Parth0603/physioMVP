from app.services.auth_service import auth_service, AuthService
from app.services.academic_service import academic_service, AcademicService
from app.services.content_service import content_service, ContentService
from app.services.question_service import question_service, QuestionService
from app.services.progress_service import progress_service, ProgressService
from app.services.study_plan_service import study_plan_service, StudyPlanService

__all__ = [
    "auth_service",
    "AuthService",
    "academic_service",
    "AcademicService",
    "content_service",
    "ContentService",
    "question_service",
    "QuestionService",
    "progress_service",
    "ProgressService",
    "study_plan_service",
    "StudyPlanService",
]
