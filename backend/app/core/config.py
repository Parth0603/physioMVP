"""Application configuration loaded from environment variables."""
import os
import logging
from typing import List
from pydantic_settings import BaseSettings

logger = logging.getLogger(__name__)


def _get_default_database_url() -> str:
    env_url = os.getenv("DATABASE_URL")
    if env_url:
        return env_url

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
        seed_db = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "db", "seed.db"))
        try:
            if not os.path.exists(tmp_db) and os.path.exists(seed_db):
                import shutil
                shutil.copyfile(seed_db, tmp_db)
        except Exception as e:
            logger.error(f"Failed to copy seed db to /tmp: {e}")
        return f"sqlite:///{tmp_db}"

    local_db = os.path.abspath(os.path.join(root_dir, "physiosmart.db")).replace(chr(92), "/")
    return f"sqlite:///{local_db}"


class Settings(BaseSettings):
    APP_NAME: str = "PHYSIO-SMART"
    APP_ENV: str = "development"
    PROJECT_NAME: str = "PHYSIO-SMART - AI-Powered Adaptive Learning Platform"
    API_V1_STR: str = "/api/v1"

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ]

    # Database: Supports PostgreSQL by default, with automatic graceful SQLite fallback
    DATABASE_URL: str = _get_default_database_url()

    # JWT Authentication
    JWT_SECRET_KEY: str = os.getenv(
        "JWT_SECRET_KEY", "supersecretjwtkey_for_development_replace_in_production_min32chars"
    )
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))  # 24 hours

    # AI Configuration (Abstraction Layer for Gemini)
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-1.5-pro")
    AI_TEMPERATURE: float = float(os.getenv("AI_TEMPERATURE", "0.2"))
    AI_MAX_OUTPUT_TOKENS: int = int(os.getenv("AI_MAX_OUTPUT_TOKENS", "2048"))
    AI_REQUEST_TIMEOUT: int = int(os.getenv("AI_REQUEST_TIMEOUT", "30"))
    AI_MAX_RETRIES: int = int(os.getenv("AI_MAX_RETRIES", "3"))

    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "ignore"


settings = Settings()
