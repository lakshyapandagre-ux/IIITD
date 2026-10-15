from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel
from app.models.college import CollegeBase
from app.models.capability import CapabilityOfferBase, CapabilityNeedBase


class CollegeCreate(CollegeBase):
    id: str


class CollegeUpdate(BaseModel):
    name: Optional[str] = None
    institution: Optional[str] = None
    campus_code: Optional[str] = None
    domain: Optional[str] = None
    verification_status: Optional[str] = None
    faculty_poc: Optional[str] = None
    lead_student: Optional[str] = None
    avatar_url: Optional[str] = None
    banner_gradient: Optional[str] = None
    weekly_available_hours: Optional[int] = None
    is_overlooked: Optional[bool] = None
    lab_address: Optional[str] = None
    trust_score: Optional[int] = None


class CollegeRead(CollegeBase):
    id: str
    created_at: datetime
    updated_at: datetime
    offers: List["CapabilityOfferRead"] = []
    needs: List["CapabilityNeedRead"] = []

    class Config:
        from_attributes = True


class CapabilityLedgerUpdate(BaseModel):
    offers: List[CapabilityOfferBase] = []
    needs: List[CapabilityNeedBase] = []
