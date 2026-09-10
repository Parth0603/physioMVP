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

_db_ready = False


def _ensure_db_ready():
    global _db_ready
    if _db_ready:
        return
    try:
        import os
        import shutil
        root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
        is_serverless = (
            bool(os.getenv("VERCEL"))
            or bool(os.getenv("VERCEL_ENV"))
            or bool(os.getenv("VERCEL_REGION"))
            or bool(os.getenv("AWS_LAMBDA_FUNCTION_NAME"))
            or bool(os.getenv("LAMBDA_TASK_ROOT"))
            or not os.access(root_dir, os.W_OK)
        )
        if is_serverless:
            tmp_db = "/tmp/physiosmart.db"
            seed_db = os.path.abspath(os.path.join(os.path.dirname(__file__), "seed.db"))
            if not os.path.exists(tmp_db) and os.path.exists(seed_db):
                shutil.copyfile(seed_db, tmp_db)
                logger.info(f"Copied seed.db ({os.path.getsize(seed_db)} bytes) to {tmp_db}")
        Base.metadata.create_all(bind=engine)
        _db_ready = True
    except Exception as e:
        logger.error(f"Error ensuring database tables: {e}")


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency yielding a database session per request, ensuring clean teardown."""
    _ensure_db_ready()
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

