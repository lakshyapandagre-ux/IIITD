import uuid
from typing import Optional, List
from datetime import datetime, timezone
from sqlmodel import SQLModel, Field, Relationship, Column
from sqlalchemy import JSON


class ExchangeItemBase(SQLModel):
    title: str = Field(index=True)
    type: str = Field(default="equipment", index=True)  # equipment, field_access, human_resource
    category: str = Field(default="Hardware", index=True)
    lab_name: str
    availability: str = Field(default="Available Saturdays 09:00 - 17:00")
    faculty_poc: str
    description: str
    specs: List[str] = Field(default=[], sa_column=Column(JSON))
    capacity: str = Field(default="Standard collaboration quota")
    status: str = Field(default="Available", index=True)  # Available, Reserved, In Maintenance
    image_url: str = Field(default="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80")


class ExchangeItem(ExchangeItemBase, table=True):
    __tablename__ = "exchange_items"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    organization_id: uuid.UUID = Field(foreign_key="organizations.id", index=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    # Relationships
    organization: Optional["Organization"] = Relationship(back_populates="exchange_items")
    reservations: List["Reservation"] = Relationship(back_populates="item")


class ReservationBase(SQLModel):
    reserved_by_institution: str
    reserved_date: str
    time_slot: str
    scope_of_use: str
    status: str = Field(default="Confirmed")  # Confirmed, Pending, Cancelled


class Reservation(ReservationBase, table=True):
    __tablename__ = "reservations"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    item_id: uuid.UUID = Field(foreign_key="exchange_items.id", index=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    # Relationships
    item: Optional[ExchangeItem] = Relationship(back_populates="reservations")


from app.models.organization import Organization
