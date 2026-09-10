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
from app.models.faculty_profile import FacultyProfile
from app.models.admin_profile import AdminProfile
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

        # Create role-specific profile based on selected role
        if req.role == UserRole.STUDENT:
            profile = StudentProfile(
                user_id=user.id,
                institution=req.institution or "Apex Institute of Physiotherapy & Allied Sciences",
                course=req.course or "Bachelor of Physiotherapy (BPT)",
                academic_year=req.academic_year or 1,
                semester=req.semester or 1,
                enrollment_id=req.enrollment_id or f"BPT-{user.id:04d}",
            )
            db.add(profile)
            db.commit()
        elif req.role == UserRole.FACULTY:
            f_profile = FacultyProfile(
                user_id=user.id,
                institution=req.institution or "Apex Institute of Physiotherapy & Allied Sciences",
                department=req.department or "Musculoskeletal & Orthopedics",
                designation=req.designation or "Assistant Professor",
                subjects_taught=req.subjects_taught or "Biomechanics & Kinesiology, Orthopedics",
                faculty_id_number=req.faculty_id_number or f"FAC-{user.id:03d}",
            )
            db.add(f_profile)
            db.commit()
        elif req.role == UserRole.ADMIN:
            a_profile = AdminProfile(
                user_id=user.id,
                institution=req.institution or "Apex Institute of Physiotherapy & Allied Sciences",
                department=req.department or "Academic Affairs & Examination Council",
                designation=req.designation or "Academic Administrator",
                employee_id=req.employee_id or f"ADM-{user.id:03d}",
            )
            db.add(a_profile)
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
