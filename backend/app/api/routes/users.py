"""User management API endpoints (Admin only)."""
from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.user import UserResponse, UserUpdate
from app.api.dependencies.auth import require_admin
from app.repositories.domain import user_repo
from app.core.exceptions import EntityNotFoundException
from app.models.user import User

router = APIRouter(prefix="/users", tags=["Users (Admin)"])


@router.get(
    "/",
    response_model=List[UserResponse],
    dependencies=[Depends(require_admin)],
    summary="List all users (Admin only)",
)
def list_users(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    return user_repo.get_multi(db, skip=skip, limit=limit)


@router.get(
    "/{user_id}",
    response_model=UserResponse,
    dependencies=[Depends(require_admin)],
    summary="Get user details by ID (Admin only)",
)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = user_repo.get_with_profile(db, user_id)
    if not user:
        raise EntityNotFoundException("User", user_id)
    return user


@router.put(
    "/{user_id}",
    response_model=UserResponse,
    dependencies=[Depends(require_admin)],
    summary="Update user details / role / active state (Admin only)",
)
def update_user(user_id: int, data: UserUpdate, db: Session = Depends(get_db)):
    user = user_repo.get(db, user_id)
    if not user:
        raise EntityNotFoundException("User", user_id)
    return user_repo.update(db, user, data.dict(exclude_unset=True))
