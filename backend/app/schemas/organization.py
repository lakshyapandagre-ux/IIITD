import uuid
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel
from app.models.organization import OrganizationBase
from app.schemas.institution import InstitutionRead


class CapabilityItem(BaseModel):
    id: Optional[uuid.UUID] = None
    name: str
    type: str = "skill"  # skill, equipment, field_access
    direction: str = "OFFER"  # OFFER, NEED
    capacity_detail: str = "Standard collaboration quota"

    class Config:
        from_attributes = True


class OrganizationCreate(OrganizationBase):
    institution_id: uuid.UUID
    capabilities: List[CapabilityItem] = []


class OrganizationUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    verification_tier: Optional[str] = None
    faculty_poc: Optional[str] = None
    weekly_available_hours: Optional[int] = None
    is_overlooked: Optional[bool] = None
    avatar_url: Optional[str] = None


class OrganizationRead(OrganizationBase):
    id: uuid.UUID
    institution_id: uuid.UUID
    institution: Optional[InstitutionRead] = None
    capabilities: List[CapabilityItem] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CapabilityLedgerUpdate(BaseModel):
    capabilities: List[CapabilityItem] = []
