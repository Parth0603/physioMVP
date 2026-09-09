"""Student Profile model capturing academic context (Institution, BPT course, year, semester)."""
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base


class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    institution = Column(String(255), nullable=True)
    course = Column(String(100), default="Bachelor of Physiotherapy (BPT)", nullable=False)
    academic_year = Column(Integer, default=1, nullable=False)  # 1st, 2nd, 3rd, 4th year
    semester = Column(Integer, default=1, nullable=False)       # Semester 1-8
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    user = relationship("User", back_populates="student_profile")
