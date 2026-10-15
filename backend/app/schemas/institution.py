import uuid
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel
from app.models.institution import InstitutionBase


class InstitutionCreate(InstitutionBase):
    pass


class InstitutionRead(InstitutionBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
