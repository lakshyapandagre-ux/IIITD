from typing import List, Union
from pydantic import AnyHttpUrl
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "NexusCollab - Inter-College Collaboration Network"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Environment & Security
    ENVIRONMENT: str = "development"
    SECRET_KEY: str = "collabnet-super-secure-production-jwt-secret-key-384bit"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database Configuration (PostgreSQL 16 with pgvector)
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/collabnet"
    SYNC_DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/collabnet"
    
    # Redis Cache Configuration
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # CORS Origins
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]
    
    # Vector Search Configuration
    VECTOR_DIMENSION: int = 384  # all-MiniLM-L6-v2 vector embeddings dimension
    
    # Matching Weights for S(A, B) = w1*C + w2*G + w3*R + w4*T
    WEIGHT_COMPLEMENTARITY: float = 0.40
    WEIGHT_GOAL_ALIGNMENT: float = 0.25
    WEIGHT_RESOURCE_AVAILABILITY: float = 0.20
    WEIGHT_TRUST_VERIFICATION: float = 0.15
    EXPLORATION_BOOST_MULTIPLIER: float = 1.15

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="allow"
    )


settings = Settings()
