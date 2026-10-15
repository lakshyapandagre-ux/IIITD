import uuid
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel
from app.models.exchange import ExchangeItemBase, ReservationBase


class ExchangeItemCreate(ExchangeItemBase):
    organization_id: uuid.UUID


class ReservationCreate(BaseModel):
    item_id: uuid.UUID
    reserved_by_institution: str
    reserved_date: str
    time_slot: str
    scope_of_use: str


class ReservationRead(ReservationBase):
    id: uuid.UUID
    item_id: uuid.UUID
    created_at: datetime

    class Config:
        from_attributes = True


class ExchangeItemRead(ExchangeItemBase):
    id: uuid.UUID
    organization_id: uuid.UUID
    organization_name: Optional[str] = None
    institution_name: Optional[str] = None
    created_at: datetime
    reservations: List[ReservationRead] = []

    class Config:
        from_attributes = True
