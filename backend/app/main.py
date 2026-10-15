import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text
from app.core.config import settings
from app.core.database import init_db, engine, async_session_maker
from app.api.v1.api import api_router
from app.seed.seed_data import seed_initial_data

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("uvicorn.error")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Startup:
    1. Check/create pgvector extension in PostgreSQL.
    2. Create SQLModel/SQLAlchemy database tables.
    3. Seed default institutions, organizations, capabilities, exchange items, and active charter.
    """
    logger.info("Starting NexusCollab Backend engine...")
    try:
        await init_db()
        async with async_session_maker() as session:
            await seed_initial_data(session)
    except Exception as exc:
        logger.error(f"Error during database startup / initialization: {exc}", exc_info=True)

    yield

    logger.info("Shutting down NexusCollab Backend engine...")
    await engine.dispose()


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    lifespan=lifespan,
)

# CORS Middleware explicitly configured for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["Health & Status"])
async def health_check():
    """
    Health check endpoint verifying:
    - Service running status
    - Database connection
    - PostgreSQL pgvector extension readiness
    """
    db_connected = False
    pgvector_ready = False
    details = {}

    try:
        async with engine.connect() as conn:
            res = await conn.execute(text("SELECT 1;"))
            val = res.scalar()
            db_connected = bool(val == 1)

            # Check pgvector extension
            vec_res = await conn.execute(text("SELECT extname FROM pg_extension WHERE extname = 'vector';"))
            ext = vec_res.scalar()
            pgvector_ready = bool(ext == "vector")
            details["database"] = "Connected"
            details["pgvector_extension"] = "Active" if pgvector_ready else "Not loaded / SQLite mode"
    except Exception as exc:
        details["database_error"] = str(exc)

    return {
        "status": "healthy" if db_connected else "degraded",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "db_connected": db_connected,
        "pgvector_ready": pgvector_ready,
        "details": details,
    }


@app.get("/", tags=["Root"])
async def root():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME} Backend API",
        "documentation": f"{settings.API_V1_STR}/docs",
        "health": "/health",
    }


# Include V1 API Routers
app.include_router(api_router, prefix=settings.API_V1_STR)


# Global Exception Handler
@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled server error at {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error occurred. Please contact the administrator."},
    )
