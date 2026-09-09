from fastapi import APIRouter
from app.api.routes import (
    auth,
    users,
    subjects,
    units,
    topics,
    content,
    questions,
    progress,
    study_plans,
    ai,
)

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(subjects.router)
api_router.include_router(units.router)
api_router.include_router(topics.router)
api_router.include_router(content.router)
api_router.include_router(questions.router)
api_router.include_router(progress.router)
api_router.include_router(study_plans.router)
api_router.include_router(ai.router)
