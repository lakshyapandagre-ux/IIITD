from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlmodel import select
from app.core.database import get_db
from app.core.security import is_valid_institutional_domain
from app.models.college import College
from app.models.capability import CapabilityOffer, CapabilityNeed
from app.schemas.college import CollegeCreate, CollegeRead, CollegeUpdate, CapabilityLedgerUpdate
from app.services.matching_service import generate_text_embedding

router = APIRouter()


@router.get("/", response_model=List[CollegeRead])
async def list_colleges(
    db: AsyncSession = Depends(get_db),
    domain: str = None,
    overlooked_only: bool = False,
):
    """List all registered institutional colleges and labs."""
    stmt = select(College).options(
        selectinload(College.offers),
        selectinload(College.needs)
    )
    if domain:
        stmt = stmt.where(College.domain == domain)
    if overlooked_only:
        stmt = stmt.where(College.is_overlooked == True)
        
    res = await db.execute(stmt)
    return res.scalars().all()


@router.get("/{college_id}", response_model=CollegeRead)
async def get_college(
    college_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get single college details including capability ledger."""
    stmt = select(College).where(College.id == college_id).options(
        selectinload(College.offers),
        selectinload(College.needs)
    )
    res = await db.execute(stmt)
    college = res.scalars().first()
    if not college:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"College '{college_id}' not found."
        )
    return college


@router.post("/", response_model=CollegeRead, status_code=status.HTTP_201_CREATED)
async def register_college(
    payload: CollegeCreate,
    db: AsyncSession = Depends(get_db),
):
    """Register and attest a new university lab/club with institutional domain validation."""
    if not is_valid_institutional_domain(payload.domain_attestation):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Domain attestation failed. Must be an accredited institution (.edu or .ac.in)."
        )

    # Check if exists
    stmt = select(College).where(College.id == payload.id)
    res = await db.execute(stmt)
    if res.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"College with ID '{payload.id}' already exists."
        )

    college = College(**payload.dict())
    db.add(college)
    await db.commit()
    await db.refresh(college)
    return college


@router.put("/{college_id}/ledger", response_model=CollegeRead)
async def update_capability_ledger(
    college_id: str,
    payload: CapabilityLedgerUpdate,
    db: AsyncSession = Depends(get_db),
):
    """
    Update institutional capability ledger (surplus offers and capability deficits).
    Computes vector embeddings for each entry for pgvector semantic search.
    """
    stmt = select(College).where(College.id == college_id).options(
        selectinload(College.offers),
        selectinload(College.needs)
    )
    res = await db.execute(stmt)
    college = res.scalars().first()
    if not college:
        raise HTTPException(status_code=404, detail="College not found")

    # Clear old offers and needs
    for old_offer in college.offers:
        await db.delete(old_offer)
    for old_need in college.needs:
        await db.delete(old_need)
    await db.flush()

    # Insert new offers with embeddings
    for off in payload.offers:
        embedding = generate_text_embedding(f"{off.title} {off.category} {' '.join(off.tags)}")
        new_off = CapabilityOffer(
            club_id=college_id,
            title=off.title,
            category=off.category,
            capacity=off.capacity,
            tags=off.tags,
            embedding=embedding,
        )
        db.add(new_off)

    # Insert new needs with embeddings
    for need in payload.needs:
        embedding = generate_text_embedding(f"{need.title} {need.category} {need.urgency}")
        new_need = CapabilityNeed(
            club_id=college_id,
            title=need.title,
            category=need.category,
            urgency=need.urgency,
            embedding=embedding,
        )
        db.add(new_need)

    await db.commit()
    await db.refresh(college)
    return college
