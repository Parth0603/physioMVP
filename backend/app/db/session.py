"""Database session management with SQLAlchemy 2.0."""
import logging
from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from app.core.config import settings

logger = logging.getLogger(__name__)

# Configure connect_args based on DB dialect (e.g. check_same_thread for SQLite fallback)
connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False

# Create database engine
try:
    engine = create_engine(
        settings.DATABASE_URL,
        pool_pre_ping=True,
        echo=False,
        connect_args=connect_args,
    )
except Exception as e:
    logger.error(f"Failed to create database engine for {settings.DATABASE_URL}: {e}")
    raise

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency yielding a database session per request, ensuring clean teardown."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
