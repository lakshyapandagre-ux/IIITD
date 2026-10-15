import uuid
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel
from app.models.capability import CapabilityBase, OrganizationCapabilityBase


class CapabilityCreate(CapabilityBase):
    pass


class CapabilityRead(CapabilityBase):
    id: uuid.UUID
    created_at: datetime

    class Config:
        from_attributes = True


class OrganizationCapabilityCreate(OrganizationCapabilityBase):
    capability_id: uuid.UUID
    organization_id: uuid.UUID


class OrganizationCapabilityRead(OrganizationCapabilityBase):
    id: uuid.UUID
    organization_id: uuid.UUID
    capability_id: uuid.UUID
    capability: Optional[CapabilityRead] = None
    created_at: datetime

    class Config:
        from_attributes = True
