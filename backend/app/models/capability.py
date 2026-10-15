import uuid
from typing import Optional, List
from datetime import datetime, timezone
from sqlmodel import SQLModel, Field, Relationship, Column
from pgvector.sqlalchemy import Vector


class CapabilityBase(SQLModel):
    name: str = Field(index=True)
    type: str = Field(default="skill", index=True)  # skill, equipment, field_access


class Capability(CapabilityBase, table=True):
    __tablename__ = "capabilities"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    # Relationships
    organization_capabilities: List["OrganizationCapability"] = Relationship(back_populates="capability")


class OrganizationCapabilityBase(SQLModel):
    direction: str = Field(index=True)  # 'OFFER' vs 'NEED'
    capacity_detail: str = Field(default="Standard collaboration quota")


class OrganizationCapability(OrganizationCapabilityBase, table=True):
    __tablename__ = "organization_capabilities"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    organization_id: uuid.UUID = Field(foreign_key="organizations.id", index=True)
    capability_id: uuid.UUID = Field(foreign_key="capabilities.id", index=True)

    # Vector embedding for pgvector capability search
    embedding: Optional[List[float]] = Field(default=None, sa_column=Column(Vector(384)))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    # Relationships
    organization: Optional["Organization"] = Relationship(back_populates="capabilities")
    capability: Optional[Capability] = Relationship(back_populates="organization_capabilities")


from app.models.organization import Organization
