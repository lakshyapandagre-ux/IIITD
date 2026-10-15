from typing import Optional, List
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship


class CollegeBase(SQLModel):
    name: str = Field(index=True)
    institution: str = Field(index=True)
    campus_code: str = Field(unique=True, index=True)
    domain: str = Field(index=True)  # Robotics, AI, Biotech, Design, Hardware, Energy
    verification_status: str = Field(default="Tier 2 Faculty Verified")
    domain_attestation: str = Field(index=True)  # e.g., iiti.ac.in
    faculty_poc: str
    lead_student: Optional[str] = None
    avatar_url: str = Field(default="🏛️")
    banner_gradient: Optional[str] = None
    weekly_available_hours: int = Field(default=40)
    is_overlooked: bool = Field(default=False, index=True)  # Exploration Boost
    lab_address: str = Field(default="Central Campus Innovation Lab")
    trust_score: int = Field(default=90)


class College(CollegeBase, table=True):
    __tablename__ = "colleges"

    id: Optional[str] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    offers: List["CapabilityOffer"] = Relationship(back_populates="club")
    needs: List["CapabilityNeed"] = Relationship(back_populates="club")
    exchange_items: List["ExchangeItem"] = Relationship(back_populates="college")


from app.models.capability import CapabilityOffer, CapabilityNeed
from app.models.exchange import ExchangeItem
