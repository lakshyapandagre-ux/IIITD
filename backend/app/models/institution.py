import uuid
from typing import Optional, List
from datetime import datetime, timezone
from sqlmodel import SQLModel, Field, Relationship


class InstitutionBase(SQLModel):
    name: str = Field(index=True)
    domain: str = Field(unique=True, index=True)  # e.g., iiti.ac.in, sgsits.ac.in
    is_verified: bool = Field(default=True)
    campus_location: Optional[str] = Field(default="Indore, Madhya Pradesh")


class Institution(InstitutionBase, table=True):
    __tablename__ = "institutions"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    # Relationships
    organizations: List["Organization"] = Relationship(back_populates="institution")


from app.models.organization import Organization
