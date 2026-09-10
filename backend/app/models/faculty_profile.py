"""Faculty Profile model capturing academic and clinical departmental context."""
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base


class FacultyProfile(Base):
    __tablename__ = "faculty_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    institution = Column(String(255), nullable=True)
    department = Column(String(150), default="Musculoskeletal & Orthopedics", nullable=False)
    designation = Column(String(100), default="Assistant Professor", nullable=False)
    subjects_taught = Column(String(255), default="Biomechanics & Kinesiology, Orthopedics", nullable=True)
    faculty_id_number = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    user = relationship("User", back_populates="faculty_profile")
