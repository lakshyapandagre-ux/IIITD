import uuid
from typing import Optional, List
from datetime import datetime, timezone
from sqlmodel import SQLModel, Field, Relationship, Column
from pgvector.sqlalchemy import Vector


class OrganizationBase(SQLModel):
    name: str = Field(index=True)
    slug: str = Field(unique=True, index=True)
    category: str = Field(index=True)  # Robotics, AI, Design, Biotech, Hardware, Energy
    description: str
    verification_tier: str = Field(default="faculty_verified", index=True)  # unverified, student_verified, faculty_verified
    faculty_poc: Optional[str] = Field(default="Dr. Faculty Advisor")
    weekly_available_hours: int = Field(default=40)
    is_overlooked: bool = Field(default=False, index=True)  # Exploration Boost trigger
    trust_score: int = Field(default=92)
    avatar_url: str = Field(default="🏛️")


class Organization(OrganizationBase, table=True):
    __tablename__ = "organizations"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    institution_id: uuid.UUID = Field(foreign_key="institutions.id", index=True)

    # 384-dimension vector embedding for all-MiniLM-L6-v2 semantic search
    description_embedding: Optional[List[float]] = Field(default=None, sa_column=Column(Vector(384)))

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    # Relationships
    institution: Optional["Institution"] = Relationship(back_populates="organizations")
    capabilities: List["OrganizationCapability"] = Relationship(back_populates="organization")
    exchange_items: List["ExchangeItem"] = Relationship(back_populates="organization")
    charter_participations: List["CharterParticipant"] = Relationship(back_populates="organization")


from app.models.institution import Institution
from app.models.capability import OrganizationCapability
from app.models.exchange import ExchangeItem
from app.models.charter import CharterParticipant
