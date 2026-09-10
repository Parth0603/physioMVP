"""User management API endpoints (Admin only and User Self-Profile)."""
from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.user import UserResponse, UserUpdate, ProfileUpdateRequest
from app.api.dependencies.auth import require_admin, get_current_user
from app.repositories.domain import user_repo
from app.core.exceptions import EntityNotFoundException
from app.models.user import User, UserRole
from app.models.student_profile import StudentProfile
from app.models.faculty_profile import FacultyProfile
from app.models.admin_profile import AdminProfile

router = APIRouter(prefix="/users", tags=["Users"])


@router.put("/profile/me", response_model=UserResponse, summary="Update current user's profile details")
def update_my_profile(
    data: ProfileUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if data.name:
        current_user.name = data.name

    if current_user.role == UserRole.STUDENT:
        if not current_user.student_profile:
            current_user.student_profile = StudentProfile(user_id=current_user.id)
            db.add(current_user.student_profile)
        if data.institution is not None:
            current_user.student_profile.institution = data.institution
        if data.course is not None:
            current_user.student_profile.course = data.course
        if data.academic_year is not None:
            current_user.student_profile.academic_year = data.academic_year
        if data.semester is not None:
            current_user.student_profile.semester = data.semester
        if data.enrollment_id is not None:
            current_user.student_profile.enrollment_id = data.enrollment_id

    elif current_user.role == UserRole.FACULTY:
        if not current_user.faculty_profile:
            current_user.faculty_profile = FacultyProfile(user_id=current_user.id)
            db.add(current_user.faculty_profile)
        if data.institution is not None:
            current_user.faculty_profile.institution = data.institution
        if data.department is not None:
            current_user.faculty_profile.department = data.department
        if data.designation is not None:
            current_user.faculty_profile.designation = data.designation
        if data.subjects_taught is not None:
            current_user.faculty_profile.subjects_taught = data.subjects_taught
        if data.faculty_id_number is not None:
            current_user.faculty_profile.faculty_id_number = data.faculty_id_number

    elif current_user.role == UserRole.ADMIN:
        if not current_user.admin_profile:
            current_user.admin_profile = AdminProfile(user_id=current_user.id)
            db.add(current_user.admin_profile)
        if data.institution is not None:
            current_user.admin_profile.institution = data.institution
        if data.department is not None:
            current_user.admin_profile.department = data.department
        if data.designation is not None:
            current_user.admin_profile.designation = data.designation
        if data.employee_id is not None:
            current_user.admin_profile.employee_id = data.employee_id

    db.commit()
    return user_repo.get_with_profile(db, current_user.id)


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
