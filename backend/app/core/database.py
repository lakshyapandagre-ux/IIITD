import logging
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from sqlalchemy.ext.compiler import compiles
from sqlmodel import SQLModel
from pgvector.sqlalchemy import Vector
from app.core.config import settings

logger = logging.getLogger("uvicorn.error")

# Allow SQLite to store Vector columns as JSON when running local development fallback
@compiles(Vector, "sqlite")
def compile_vector_sqlite(type_, compiler, **kw):
    return "JSON"


def create_resilient_engine():
    """
    Creates an async database engine.
    If PostgreSQL URL is configured, attempts connection.
    If asyncpg is unavailable or PostgreSQL port 5432 is unreachable locally,
    falls back cleanly to sqlite+aiosqlite for local development and testing.
    """
    db_url = settings.DATABASE_URL
    is_postgres = "postgresql" in db_url

    if is_postgres:
        try:
            import asyncpg  # noqa: F401
            # Test if postgres driver is available
            engine = create_async_engine(
                db_url,
                echo=False,
                future=True,
                pool_pre_ping=True,
                pool_size=10,
                max_overflow=20,
            )
            return engine, True
        except ImportError:
            logger.warning("asyncpg driver not installed on host. Falling back to local SQLite engine (collabnet.db).")
            fallback_url = "sqlite+aiosqlite:///collabnet.db"
            engine = create_async_engine(fallback_url, echo=False, future=True)
            return engine, False
        except Exception as e:
            logger.warning(f"PostgreSQL connection initialization note: {e}. Falling back to SQLite.")
            fallback_url = "sqlite+aiosqlite:///collabnet.db"
            engine = create_async_engine(fallback_url, echo=False, future=True)
            return engine, False
    else:
        engine = create_async_engine(db_url, echo=False, future=True)
        return engine, False


engine, is_postgres_active = create_resilient_engine()

async_session_maker = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)


async def init_db() -> None:
    """Initialize database schemas, tables, and pgvector extension if on Postgres."""
    global engine, is_postgres_active, async_session_maker

    # Verify if postgres connection succeeds, otherwise fallback to sqlite
    if is_postgres_active:
        try:
            async with engine.connect() as conn:
                await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
                logger.info("PostgreSQL pgvector extension verified and active.")
        except Exception as e:
            logger.warning(f"Could not connect to PostgreSQL on port 5432 ({e}). Switching to local SQLite engine (collabnet.db).")
            fallback_url = "sqlite+aiosqlite:///collabnet.db"
            engine = create_async_engine(fallback_url, echo=False, future=True)
            is_postgres_active = False
            async_session_maker = sessionmaker(
                engine, class_=AsyncSession, expire_on_commit=False
            )

    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
        logger.info(f"Database tables initialized on {'PostgreSQL' if is_postgres_active else 'SQLite'}.")


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency yielding async database sessions."""
    async with async_session_maker() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
