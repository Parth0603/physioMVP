"""Units REST API."""
from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.academic import UnitResponse, UnitCreate, UnitUpdate
from app.services.academic_service import academic_service
from app.api.dependencies.auth import get_current_user, require_admin
from app.models.user import User

router = APIRouter(prefix="/units", tags=["Units"])


@router.get(
    "/subject/{subject_id}",
    response_model=List[UnitResponse],
    summary="List all units for a given subject",
)
def list_units_by_subject(
    subject_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return academic_service.list_units_by_subject(db, subject_id)


@router.post(
    "/",
    response_model=UnitResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_admin)],
    summary="Create a new unit (Admin only)",
)
def create_unit(data: UnitCreate, db: Session = Depends(get_db)):
    return academic_service.create_unit(db, data)


@router.put(
    "/{unit_id}",
    response_model=UnitResponse,
    dependencies=[Depends(require_admin)],
    summary="Update a unit (Admin only)",
)
def update_unit(unit_id: int, data: UnitUpdate, db: Session = Depends(get_db)):
    return academic_service.update_unit(db, unit_id, data)


@router.delete(
    "/{unit_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_admin)],
    summary="Delete a unit (Admin only)",
)
def delete_unit(unit_id: int, db: Session = Depends(get_db)):
    academic_service.delete_unit(db, unit_id)
