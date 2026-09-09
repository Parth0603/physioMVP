"""Authentication API endpoints: Register, Login, Current User Profile."""
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.auth import LoginRequest, RegisterRequest, Token
from app.schemas.user import UserResponse
from app.services.auth_service import auth_service
from app.api.dependencies.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=Token,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user (Student by default, or Faculty/Admin)",
)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    return auth_service.register(db, req)


@router.post(
    "/login",
    response_model=Token,
    summary="Authenticate and receive JWT access token",
)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    return auth_service.login(db, req)


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get profile of currently logged-in user",
)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
