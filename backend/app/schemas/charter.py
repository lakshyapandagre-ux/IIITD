import uuid
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel
from app.models.charter import (
    ProjectCharterBase,
    CharterParticipantBase,
    CharterMilestoneBase,
)


class CharterParticipantCreate(BaseModel):
    organization_id: uuid.UUID
    role: str = "Lead Partner"
    allocated_hours_per_week: int = 20


class CharterParticipantRead(CharterParticipantBase):
    id: uuid.UUID
    charter_id: uuid.UUID
    organization_name: Optional[str] = None
    institution_name: Optional[str] = None

    class Config:
        from_attributes = True


class CharterMilestoneCreate(BaseModel):
    title: str
    assigned_organization_id: uuid.UUID
    deadline: str
    required_signatures: int = 2
    spec_notes: Optional[str] = None


class CharterMilestoneRead(CharterMilestoneBase):
    id: uuid.UUID
    charter_id: uuid.UUID
    created_at: datetime
    assigned_organization_name: Optional[str] = None

    class Config:
        from_attributes = True


class ProjectCharterCreate(ProjectCharterBase):
    participants: List[CharterParticipantCreate] = []
    milestones: List[CharterMilestoneCreate] = []


class ProjectCharterRead(ProjectCharterBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    participants: List[CharterParticipantRead] = []
    milestones: List[CharterMilestoneRead] = []

    class Config:
        from_attributes = True


class SignCharterRequest(BaseModel):
    organization_id: uuid.UUID
    signatory_name: str


class SubmitMilestoneProofRequest(BaseModel):
    proof_url: str
    proof_type: str = "github_pr"  # github_pr, cad_model, lab_report, ipfs_hash
    spec_notes: Optional[str] = None


class VerifyMilestoneRequest(BaseModel):
    verifier_name: str
