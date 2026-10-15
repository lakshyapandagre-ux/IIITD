import uuid
from typing import List, Optional, Any, Dict
from pydantic import BaseModel


class ScoreBreakdown(BaseModel):
    composite: int  # S(A, B) composite score 0 - 100
    skill_complementarity: int  # C (0 - 100)
    goal_alignment: int  # G (0 - 100)
    resource_availability: int  # R (0 - 100)
    verification_trust: int  # T (0 - 100)
    rationale: str


class CapabilityDisplay(BaseModel):
    name: str
    type: str
    capacity_detail: str


class MatchCandidate(BaseModel):
    id: uuid.UUID
    name: str
    slug: str
    institution_name: str
    institution_domain: str
    category: str
    description: str
    verification_tier: str
    faculty_poc: Optional[str]
    avatar_url: str
    weekly_available_hours: int
    is_overlooked: bool
    scores: ScoreBreakdown
    offers: List[CapabilityDisplay] = []
    needs: List[CapabilityDisplay] = []


class MatchResponse(BaseModel):
    tenant_organization_id: uuid.UUID
    tenant_name: str
    total_candidates: int
    exploration_boost_active: bool
    candidates: List[MatchCandidate]
