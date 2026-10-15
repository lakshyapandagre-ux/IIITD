import uuid
import time
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlmodel import select
from app.core.database import get_db
from app.core.security import generate_proof_hash
from app.models.charter import (
    ProjectCharter,
    CharterParticipant,
    CharterMilestone,
)
from app.models.organization import Organization
from app.schemas.charter import (
    ProjectCharterCreate,
    ProjectCharterRead,
    CharterParticipantRead,
    CharterMilestoneRead,
    SignCharterRequest,
    SubmitMilestoneProofRequest,
    VerifyMilestoneRequest,
)

router = APIRouter()


@router.get("/", response_model=List[ProjectCharterRead])
async def list_charters(db: AsyncSession = Depends(get_db)):
    """List all project charters with participants and milestones."""
    stmt = (
        select(ProjectCharter)
        .options(
            selectinload(ProjectCharter.participants).selectinload(CharterParticipant.organization),
            selectinload(ProjectCharter.milestones),
        )
    )
    res = await db.execute(stmt)
    charters = res.scalars().all()

    output = []
    for ch in charters:
        parts = [
            CharterParticipantRead(
                id=p.id,
                charter_id=p.charter_id,
                organization_id=p.organization_id,
                organization_name=p.organization.name if p.organization else "Partner Club",
                institution_name=p.organization.institution.name if p.organization and p.organization.institution else "Partner University",
                role=p.role,
                allocated_hours_per_week=p.allocated_hours_per_week,
                has_signed=p.has_signed,
                signed_at=p.signed_at,
                signatory_name=p.signatory_name,
            )
            for p in (ch.participants or [])
        ]
        miles = [
            CharterMilestoneRead(
                id=m.id,
                charter_id=m.charter_id,
                title=m.title,
                assigned_organization_id=m.assigned_organization_id,
                deadline=m.deadline,
                status=m.status,
                proof_url=m.proof_url,
                proof_type=m.proof_type,
                proof_hash=m.proof_hash,
                verified_by=m.verified_by,
                required_signatures=m.required_signatures,
                spec_notes=m.spec_notes,
                created_at=m.created_at,
            )
            for m in (ch.milestones or [])
        ]
        output.append(
            ProjectCharterRead(
                id=ch.id,
                title=ch.title,
                project_goal=ch.project_goal,
                status=ch.status,
                escrow_status=ch.escrow_status,
                contract_hash=ch.contract_hash,
                created_at=ch.created_at,
                updated_at=ch.updated_at,
                participants=parts,
                milestones=miles,
            )
        )
    return output


@router.get("/{charter_id}", response_model=ProjectCharterRead)
async def get_charter(charter_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """Get single project charter with signatories and milestones."""
    stmt = (
        select(ProjectCharter)
        .where(ProjectCharter.id == charter_id)
        .options(
            selectinload(ProjectCharter.participants).selectinload(CharterParticipant.organization),
            selectinload(ProjectCharter.milestones),
        )
    )
    res = await db.execute(stmt)
    ch = res.scalars().first()
    if not ch:
        raise HTTPException(status_code=404, detail="Project charter not found")

    parts = [
        CharterParticipantRead(
            id=p.id,
            charter_id=p.charter_id,
            organization_id=p.organization_id,
            organization_name=p.organization.name if p.organization else "Partner Club",
            role=p.role,
            allocated_hours_per_week=p.allocated_hours_per_week,
            has_signed=p.has_signed,
            signed_at=p.signed_at,
            signatory_name=p.signatory_name,
        )
        for p in (ch.participants or [])
    ]
    miles = [
        CharterMilestoneRead(
            id=m.id,
            charter_id=m.charter_id,
            title=m.title,
            assigned_organization_id=m.assigned_organization_id,
            deadline=m.deadline,
            status=m.status,
            proof_url=m.proof_url,
            proof_type=m.proof_type,
            proof_hash=m.proof_hash,
            verified_by=m.verified_by,
            required_signatures=m.required_signatures,
            spec_notes=m.spec_notes,
            created_at=m.created_at,
        )
        for m in (ch.milestones or [])
    ]

    return ProjectCharterRead(
        id=ch.id,
        title=ch.title,
        project_goal=ch.project_goal,
        status=ch.status,
        escrow_status=ch.escrow_status,
        contract_hash=ch.contract_hash,
        created_at=ch.created_at,
        updated_at=ch.updated_at,
        participants=parts,
        milestones=miles,
    )


@router.post("/", response_model=ProjectCharterRead, status_code=status.HTTP_201_CREATED)
async def create_charter(
    payload: ProjectCharterCreate,
    db: AsyncSession = Depends(get_db),
):
    """Create a new multi-college collaboration charter."""
    charter = ProjectCharter(
        title=payload.title,
        project_goal=payload.project_goal,
        status="drafting",
        escrow_status="Pending Multi-Sig",
    )
    db.add(charter)
    await db.flush()

    for p in payload.participants:
        part = CharterParticipant(
            charter_id=charter.id,
            organization_id=p.organization_id,
            role=p.role,
            allocated_hours_per_week=p.allocated_hours_per_week,
            has_signed=False,
        )
        db.add(part)

    for m in payload.milestones:
        mile = CharterMilestone(
            charter_id=charter.id,
            title=m.title,
            assigned_organization_id=m.assigned_organization_id,
            deadline=m.deadline,
            status="committed",
            required_signatures=m.required_signatures,
            spec_notes=m.spec_notes,
        )
        db.add(mile)

    await db.commit()
    return await get_charter(charter.id, db)


@router.post("/{charter_id}/sign", response_model=ProjectCharterRead)
async def sign_charter(
    charter_id: uuid.UUID,
    payload: SignCharterRequest,
    db: AsyncSession = Depends(get_db),
):
    """Sign project charter. Activates charter when all required signatories have signed."""
    stmt = (
        select(ProjectCharter)
        .where(ProjectCharter.id == charter_id)
        .options(selectinload(ProjectCharter.participants))
    )
    res = await db.execute(stmt)
    charter = res.scalars().first()
    if not charter:
        raise HTTPException(status_code=404, detail="Charter not found")

    signed_one = False
    for p in charter.participants:
        if p.organization_id == payload.organization_id:
            p.has_signed = True
            p.signed_at = time.strftime("%Y-%m-%d %H:%M:%S")
            p.signatory_name = payload.signatory_name
            signed_one = True

    if not signed_one:
        raise HTTPException(status_code=400, detail="Organization is not a registered participant in this charter")

    # If all participants have signed, activate charter
    all_signed = all(p.has_signed for p in charter.participants)
    if all_signed:
        charter.status = "active"
        charter.escrow_status = "Active"

    await db.commit()
    return await get_charter(charter_id, db)


@router.post("/{charter_id}/milestones/{milestone_id}/proof", response_model=CharterMilestoneRead)
async def submit_milestone_proof(
    charter_id: uuid.UUID,
    milestone_id: uuid.UUID,
    payload: SubmitMilestoneProofRequest,
    db: AsyncSession = Depends(get_db),
):
    """Submit milestone deliverable artifact (GitHub PR, CAD model, lab report) for peer verification."""
    stmt = select(CharterMilestone).where(
        CharterMilestone.id == milestone_id,
        CharterMilestone.charter_id == charter_id,
    )
    res = await db.execute(stmt)
    mile = res.scalars().first()
    if not mile:
        raise HTTPException(status_code=404, detail="Milestone not found")

    mile.proof_url = payload.proof_url
    mile.proof_type = payload.proof_type
    mile.status = "in_review"
    if payload.spec_notes:
        mile.spec_notes = payload.spec_notes

    await db.commit()
    await db.refresh(mile)
    return mile


@router.post("/{charter_id}/milestones/{milestone_id}/verify", response_model=CharterMilestoneRead)
async def verify_milestone(
    charter_id: uuid.UUID,
    milestone_id: uuid.UUID,
    payload: VerifyMilestoneRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Multi-sig verification: sign off on submitted deliverable.
    When quorum is achieved, transitions status to 'verified_proof' and generates SHA-256 IPFS hash.
    """
    stmt = select(CharterMilestone).where(
        CharterMilestone.id == milestone_id,
        CharterMilestone.charter_id == charter_id,
    )
    res = await db.execute(stmt)
    mile = res.scalars().first()
    if not mile:
        raise HTTPException(status_code=404, detail="Milestone not found")

    verifiers = list(mile.verified_by or [])
    if payload.verifier_name not in verifiers:
        verifiers.append(payload.verifier_name)
        mile.verified_by = verifiers

    # Check if threshold reached
    if len(verifiers) >= mile.required_signatures:
        mile.status = "verified_proof"
        mile.proof_hash = generate_proof_hash(
            str(mile.id),
            mile.proof_url or "https://artifacts.nexuscollab.org/proof",
            verifiers,
        )

    await db.commit()
    await db.refresh(mile)
    return mile
