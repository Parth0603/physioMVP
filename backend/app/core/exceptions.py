"""Standardized HTTP exceptions and error response models."""
from typing import Any, Optional
from fastapi import HTTPException, status


class PhysioSmartException(HTTPException):
    """Base exception for domain and API errors."""
    def __init__(
        self,
        status_code: int = status.HTTP_400_BAD_REQUEST,
        detail: str = "An error occurred",
        headers: Optional[dict] = None
    ):
        super().__init__(status_code=status_code, detail=detail, headers=headers)


class EntityNotFoundException(PhysioSmartException):
    def __init__(self, entity_name: str, entity_id: Any):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{entity_name} with identifier '{entity_id}' was not found"
        )


class UnauthorizedException(PhysioSmartException):
    def __init__(self, detail: str = "Could not validate credentials"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            headers={"WWW-Authenticate": "Bearer"}
        )


class ForbiddenException(PhysioSmartException):
    def __init__(self, detail: str = "Operation not permitted for your current role"):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=detail
        )


class DuplicateResourceException(PhysioSmartException):
    def __init__(self, resource: str, field: str, value: Any):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"{resource} with {field} '{value}' already exists"
        )
