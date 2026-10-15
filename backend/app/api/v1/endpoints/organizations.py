import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlmodel import select
from app.core.database import get_db
from app.models.organization import Organization
from app.models.institution import Institution
from app.models.capability import Capability, OrganizationCapability
from app.schemas.organization import (
    OrganizationCreate,
    OrganizationRead,
    OrganizationUpdate,
    CapabilityLedgerUpdate,
    CapabilityItem,
)
from app.schemas.institution import InstitutionRead
from app.services.embedding import generate_embedding

router = APIRouter()


@router.get("/", response_model=List[OrganizationRead])
async def list_organizations(
    category: Optional[str] = Query(None, description="Filter by category e.g. Robotics, AI, Biotech, Design"),
    institution: Optional[str] = Query(None, description="Filter by institution name or domain"),
    verification_tier: Optional[str] = Query(None, description="Filter by verification tier (e.g. faculty_verified)"),
    search: Optional[str] = Query(None, description="Full-text search on name, description, and capabilities"),
    overlooked_only: bool = Query(False, description="Filter for overlooked regional universities"),
    db: AsyncSession = Depends(get_db),
):
    """List all accredited college organizations with category, institution, tier, and search filters."""
    stmt = (
        select(Organization)
        .options(
            selectinload(Organization.institution),
            selectinload(Organization.capabilities).selectinload(OrganizationCapability.capability),
        )
    )
    if category and category.lower() != "all":
        stmt = stmt.where(Organization.category == category)
    if verification_tier:
        stmt = stmt.where(Organization.verification_tier == verification_tier)
    if overlooked_only:
        stmt = stmt.where(Organization.is_overlooked == True)
    if institution:
        inst_pattern = f"%{institution.lower()}%"
        stmt = stmt.join(Institution).where(
            (Institution.name.ilike(inst_pattern)) | (Institution.domain.ilike(inst_pattern))
        )
    if search:
        search_pattern = f"%{search.lower()}%"
        stmt = stmt.where(
            (Organization.name.ilike(search_pattern)) |
            (Organization.description.ilike(search_pattern)) |
            (Organization.category.ilike(search_pattern))
        )

    res = await db.execute(stmt)
    orgs = res.scalars().all()

    output = []
    for org in orgs:
        cap_items = [
            CapabilityItem(
                id=c.id,
                name=c.capability.name if c.capability else "Capability",
                type=c.capability.type if c.capability else "skill",
                direction=c.direction,
                capacity_detail=c.capacity_detail,
            )
            for c in (org.capabilities or [])
        ]
        inst_read = InstitutionRead.model_validate(org.institution) if org.institution else None
        output.append(
            OrganizationRead(
                id=org.id,
                institution_id=org.institution_id,
                institution=inst_read,
                name=org.name,
                slug=org.slug,
                category=org.category,
                description=org.description,
                verification_tier=org.verification_tier,
                faculty_poc=org.faculty_poc,
                weekly_available_hours=org.weekly_available_hours,
                is_overlooked=org.is_overlooked,
                trust_score=org.trust_score,
                avatar_url=org.avatar_url,
                capabilities=cap_items,
                created_at=org.created_at,
                updated_at=org.updated_at,
            )
        )
    return output


@router.get("/{id_or_slug}", response_model=OrganizationRead)
async def get_organization(
    id_or_slug: str,
    db: AsyncSession = Depends(get_db),
):
    """Get single organization by UUID or slug."""
    try:
        val_uuid = uuid.UUID(id_or_slug)
        stmt = select(Organization).where(Organization.id == val_uuid)
    except ValueError:
        stmt = select(Organization).where(Organization.slug == id_or_slug)

    stmt = stmt.options(
        selectinload(Organization.institution),
        selectinload(Organization.capabilities).selectinload(OrganizationCapability.capability),
    )
    res = await db.execute(stmt)
    org = res.scalars().first()
    if not org:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")

    cap_items = [
        CapabilityItem(
            id=c.id,
            name=c.capability.name if c.capability else "Capability",
            type=c.capability.type if c.capability else "skill",
            direction=c.direction,
            capacity_detail=c.capacity_detail,
        )
        for c in (org.capabilities or [])
    ]
    inst_read = InstitutionRead.model_validate(org.institution) if org.institution else None

    return OrganizationRead(
        id=org.id,
        institution_id=org.institution_id,
        institution=inst_read,
        name=org.name,
        slug=org.slug,
        category=org.category,
        description=org.description,
        verification_tier=org.verification_tier,
        faculty_poc=org.faculty_poc,
        weekly_available_hours=org.weekly_available_hours,
        is_overlooked=org.is_overlooked,
        trust_score=org.trust_score,
        avatar_url=org.avatar_url,
        capabilities=cap_items,
        created_at=org.created_at,
        updated_at=org.updated_at,
    )


@router.post("/", response_model=OrganizationRead, status_code=status.HTTP_201_CREATED)
async def create_organization(
    payload: OrganizationCreate,
    db: AsyncSession = Depends(get_db),
):
    """Register a new student club or university lab, embedding its description."""
    embedding = generate_embedding(f"{payload.name} {payload.category} {payload.description}")
    org = Organization(
        name=payload.name,
        slug=payload.slug,
        category=payload.category,
        description=payload.description,
        institution_id=payload.institution_id,
        verification_tier=payload.verification_tier,
        faculty_poc=payload.faculty_poc,
        weekly_available_hours=payload.weekly_available_hours,
        is_overlooked=payload.is_overlooked,
        trust_score=payload.trust_score,
        avatar_url=payload.avatar_url,
        description_embedding=embedding,
    )
    db.add(org)
    await db.flush()

    for cap in payload.capabilities:
        # Check or create capability
        cap_stmt = select(Capability).where(Capability.name == cap.name)
        cap_res = await db.execute(cap_stmt)
        c_obj = cap_res.scalars().first()
        if not c_obj:
            c_obj = Capability(name=cap.name, type=cap.type)
            db.add(c_obj)
            await db.flush()

        cap_embedding = generate_embedding(f"{cap.name} {cap.type} {cap.direction} {cap.capacity_detail}")
        org_cap = OrganizationCapability(
            organization_id=org.id,
            capability_id=c_obj.id,
            direction=cap.direction,
            capacity_detail=cap.capacity_detail,
            embedding=cap_embedding,
        )
        db.add(org_cap)

    await db.commit()
    return await get_organization(str(org.id), db)


@router.put("/{id_or_slug}/ledger", response_model=OrganizationRead)
async def update_capability_ledger(
    id_or_slug: str,
    payload: CapabilityLedgerUpdate,
    db: AsyncSession = Depends(get_db),
):
    """
    Update institutional capability ledger (surplus offers and capability deficits).
    Recalculates pgvector embeddings for vector search.
    """
    try:
        val_uuid = uuid.UUID(id_or_slug)
        stmt = select(Organization).where(Organization.id == val_uuid)
    except ValueError:
        stmt = select(Organization).where(Organization.slug == id_or_slug)

    stmt = stmt.options(selectinload(Organization.capabilities))
    res = await db.execute(stmt)
    org = res.scalars().first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    # Clear existing capabilities
    for old_c in (org.capabilities or []):
        await db.delete(old_c)
    await db.flush()

    for item in payload.capabilities:
        # Check or create capability
        cap_stmt = select(Capability).where(Capability.name == item.name)
        cap_res = await db.execute(cap_stmt)
        c_obj = cap_res.scalars().first()
        if not c_obj:
            c_obj = Capability(name=item.name, type=item.type)
            db.add(c_obj)
            await db.flush()

        cap_embedding = generate_embedding(f"{item.name} {item.type} {item.direction} {item.capacity_detail}")
        org_cap = OrganizationCapability(
            organization_id=org.id,
            capability_id=c_obj.id,
            direction=item.direction,
            capacity_detail=item.capacity_detail,
            embedding=cap_embedding,
        )
        db.add(org_cap)

    await db.commit()
    return await get_organization(str(org.id), db)
