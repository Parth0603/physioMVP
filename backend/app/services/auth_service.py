"""Authentication Service: Register, Login, Current User resolution."""
from sqlalchemy.orm import Session
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.exceptions import (
    UnauthorizedException,
    DuplicateResourceException,
    EntityNotFoundException,
)
from app.models.user import User, UserRole
from app.models.student_profile import StudentProfile
from app.schemas.auth import RegisterRequest, LoginRequest, Token
from app.repositories.domain import user_repo


class AuthService:
    @staticmethod
    def register(db: Session, req: RegisterRequest) -> Token:
        # Check if email is taken
        existing_user = user_repo.get_by_email(db, req.email)
        if existing_user:
            raise DuplicateResourceException("User", "email", req.email)

        # Hash password and create user
        hashed_password = get_password_hash(req.password)
        user_data = {
            "name": req.name,
            "email": req.email,
            "password_hash": hashed_password,
            "role": req.role,
            "is_active": True,
        }
        user = user_repo.create(db, user_data)

        # Create student profile if role is student
        if req.role == UserRole.STUDENT:
            profile = StudentProfile(
                user_id=user.id,
                institution=req.institution or "Default Physiotherapy College",
                course=req.course or "Bachelor of Physiotherapy (BPT)",
                academic_year=req.academic_year or 1,
                semester=req.semester or 1,
            )
            db.add(profile)
            db.commit()

        # Generate JWT token
        token_str = create_access_token(subject=user.id, role=user.role.value)
        return Token(
            access_token=token_str,
            token_type="bearer",
            role=user.role,
            user_id=user.id,
            name=user.name,
            email=user.email,
        )

    @staticmethod
    def login(db: Session, req: LoginRequest) -> Token:
        user = user_repo.get_by_email(db, req.email)
        if not user or not verify_password(req.password, user.password_hash):
            raise UnauthorizedException("Invalid email or password")

        if not user.is_active:
            raise UnauthorizedException("User account is inactive. Please contact administration.")

        token_str = create_access_token(subject=user.id, role=user.role.value)
        return Token(
            access_token=token_str,
            token_type="bearer",
            role=user.role,
            user_id=user.id,
            name=user.name,
            email=user.email,
        )

    @staticmethod
    def get_current_user_profile(db: Session, user_id: int) -> User:
        user = user_repo.get_with_profile(db, user_id)
        if not user:
            raise EntityNotFoundException("User", user_id)
        return user


auth_service = AuthService()
