"""FastAPI security dependencies for JWT extraction and Role-Based Access Control (RBAC)."""
from typing import List
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.security import decode_access_token
from app.core.exceptions import UnauthorizedException, ForbiddenException
from app.db.session import get_db
from app.models.user import User, UserRole
from app.repositories.domain import user_repo

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")


def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> User:
    """Extract and validate JWT token, returning the authenticated User instance."""
    payload = decode_access_token(token)
    if not payload:
        raise UnauthorizedException("Could not validate authentication credentials")

    user_id_str = payload.get("sub")
    if not user_id_str:
        raise UnauthorizedException("Invalid token payload")

    try:
        user_id = int(user_id_str)
    except ValueError:
        raise UnauthorizedException("Malformed user identifier in token")

    user = user_repo.get_with_profile(db, user_id)
    if not user:
        raise UnauthorizedException("User no longer exists")

    if not user.is_active:
        raise UnauthorizedException("User account is inactive")

    return user


def require_roles(allowed_roles: List[UserRole]):
    """Factory dependency ensuring current user has one of the required roles."""
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise ForbiddenException(
                f"Access forbidden: requires one of [{', '.join([r.value for r in allowed_roles])}]. Current role: {current_user.role.value}"
            )
        return current_user

    return role_checker


# Convenient role-specific dependencies
require_student = require_roles([UserRole.STUDENT, UserRole.ADMIN])
require_faculty = require_roles([UserRole.FACULTY, UserRole.ADMIN])
require_admin = require_roles([UserRole.ADMIN])
