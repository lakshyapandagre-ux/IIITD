import uuid
from typing import Optional, List
from datetime import datetime, timezone
from sqlmodel import SQLModel, Field, Relationship, Column
from sqlalchemy import JSON


class ProjectCharterBase(SQLModel):
    title: str = Field(index=True)
    project_goal: str
    status: str = Field(default="drafting", index=True)  # 'drafting', 'active', 'completed'
    escrow_status: str = Field(default="Pending Multi-Sig", index=True)
    contract_hash: str = Field(default="0x77d9c612ea09b782c5f609e99a4c0a87f12e12b4")


class ProjectCharter(ProjectCharterBase, table=True):
    __tablename__ = "project_charters"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    # Relationships
    participants: List["CharterParticipant"] = Relationship(back_populates="charter")
    milestones: List["CharterMilestone"] = Relationship(back_populates="charter")


class CharterParticipantBase(SQLModel):
    organization_id: uuid.UUID = Field(foreign_key="organizations.id", index=True)
    role: str = Field(default="Lead Partner")
    allocated_hours_per_week: int = Field(default=20)
    has_signed: bool = Field(default=False, index=True)
    signed_at: Optional[str] = None
    signatory_name: Optional[str] = None


class CharterParticipant(CharterParticipantBase, table=True):
    __tablename__ = "charter_participants"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    charter_id: uuid.UUID = Field(foreign_key="project_charters.id", index=True)

    # Relationships
    charter: Optional[ProjectCharter] = Relationship(back_populates="participants")
    organization: Optional["Organization"] = Relationship(back_populates="charter_participations")


class CharterMilestoneBase(SQLModel):
    title: str
    assigned_organization_id: uuid.UUID = Field(index=True)
    deadline: str
    status: str = Field(default="committed", index=True)  # 'committed', 'in_review', 'verified_proof'
    proof_url: Optional[str] = None
    proof_type: Optional[str] = None  # github_pr, cad_model, lab_report, ipfs_hash
    proof_hash: Optional[str] = None
    verified_by: List[str] = Field(default=[], sa_column=Column(JSON))
    required_signatures: int = Field(default=2)
    spec_notes: Optional[str] = Field(default=None)


class CharterMilestone(CharterMilestoneBase, table=True):
    __tablename__ = "charter_milestones"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    charter_id: uuid.UUID = Field(foreign_key="project_charters.id", index=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    # Relationships
    charter: Optional[ProjectCharter] = Relationship(back_populates="milestones")


from app.models.organization import Organization
