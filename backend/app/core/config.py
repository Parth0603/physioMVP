"""Application configuration loaded from environment variables."""
import os
import logging
from typing import List
from pydantic_settings import BaseSettings

logger = logging.getLogger(__name__)


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

    # Database: Supports PostgreSQL by default, with automatic graceful SQLite fallback if local PG credentials are unset
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        f"sqlite:///{os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'physiosmart.db')).replace(chr(92), '/')}",
    )

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
