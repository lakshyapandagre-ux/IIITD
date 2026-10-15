from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel
from app.models.coalition import CoalitionBase, CoalitionSlotBase


class CoalitionSlotCreate(CoalitionSlotBase):
    club_id: Optional[str] = None


class CoalitionSlotRead(CoalitionSlotBase):
    id: str
    coalition_id: str
    club_id: Optional[str] = None
    club_name: Optional[str] = None
    institution: Optional[str] = None

    class Config:
        from_attributes = True


class CoalitionCreate(CoalitionBase):
    slots: List[CoalitionSlotCreate] = []


class CoalitionRead(CoalitionBase):
    id: str
    created_at: datetime
    slots: List[CoalitionSlotRead] = []

    class Config:
        from_attributes = True


class MissingAdvisorRecommendation(BaseModel):
    missing_capability: str
    urgency: str
    best_match_club_id: str
    best_match_club_name: str
    institution: str
    complementarity_score: int
    rationale: str
    weekly_available_hours: int


class MissingAdvisorResponse(BaseModel):
    project_goal: str
    analyzed_slots_count: int
    missing_capabilities: List[str]
    recommendations: List[MissingAdvisorRecommendation]
