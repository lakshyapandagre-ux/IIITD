from typing import Optional, List
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship


class CoalitionBase(SQLModel):
    title: str = Field(index=True)
    project_goal: str
    status: str = Field(default="Drafting", index=True)  # Drafting, Ratified, Active, Concluded


class Coalition(CoalitionBase, table=True):
    __tablename__ = "coalitions"

    id: Optional[str] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    slots: List["CoalitionSlot"] = Relationship(back_populates="coalition")


class CoalitionSlotBase(SQLModel):
    slot_number: int
    role: str
    covered_capability: Optional[str] = None


class CoalitionSlot(CoalitionSlotBase, table=True):
    __tablename__ = "coalition_slots"

    id: Optional[str] = Field(default=None, primary_key=True)
    coalition_id: str = Field(foreign_key="coalitions.id", index=True)
    club_id: Optional[str] = Field(default=None, foreign_key="colleges.id", index=True)

    # Relationship
    coalition: Optional[Coalition] = Relationship(back_populates="slots")
