"""PHYSIO-SMART Backend Main Application."""
import logging
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from app.core.config import settings
from app.core.exceptions import PhysioSmartException
from app.api.routes import api_router
from app.db.session import engine, Base

# Set up structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("physio_smart")

# Initialize FastAPI App with OpenAPI metadata
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="""
# PHYSIO-SMART Backend API (Part 1: Foundation & Architecture)

An AI-Powered Adaptive Learning & Clinical Reasoning Platform for Physiotherapy Education.
*Right topic, right time, right method, for the right student.*

### Features in Part 1:
* **Authentication**: JWT token authentication with bcrypt password hashing.
* **Role-Based Access Control**: Strict segregation for `student`, `faculty`, and `admin`.
* **Academic Hierarchy**: Subjects -> Units -> Topics -> Curated Content & Questions.
* **Content CMS**: Full CRUD operations for curated physiotherapy knowledge base with verification workflows.
* **Adaptive Learning Models**: Student progress, mastery scores, study plan structure.
* **AI Abstraction Layer**: Pluggable provider architecture for Gemini integration in Parts 2-4.
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permits local development on Vite port 5173
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handler for Custom Domain Exceptions
@app.exception_handler(PhysioSmartException)
async def physio_smart_exception_handler(request: Request, exc: PhysioSmartException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
        headers=exc.headers,
    )

# Global Exception Handler for Validation Errors
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    for error in exc.errors():
        errors.append({
            "loc": ".".join(str(loc) for loc in error.get("loc", [])),
            "msg": error.get("msg"),
            "type": error.get("type"),
        })
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": "Request validation failed", "errors": errors},
    )

# Global Unexpected Server Exception Handler
@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.exception(f"Unhandled server error at {request.url.path}: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred. Please contact support."},
    )

# Mount all API routes under API_V1_STR
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/health", tags=["Health"])
def health_check():
    """Health check endpoint to verify backend service status."""
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": "1.0.0",
        "environment": settings.APP_ENV,
    }


# Ensure all database tables exist on startup if not managed via Alembic
@app.on_event("startup")
def on_startup():
    logger.info("Initializing database schema...")
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables initialized successfully.")
    except Exception as e:
        logger.error(f"Error initializing database tables: {e}")
