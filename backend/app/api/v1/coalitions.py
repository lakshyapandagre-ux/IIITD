import uuid
from typing import List, Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlmodel import select
from app.core.database import get_db
from app.api.deps import get_current_tenant_id
from app.models.coalition import Coalition, CoalitionSlot
from app.models.college import College
from app.schemas.coalition import (
    CoalitionCreate,
    CoalitionRead,
    CoalitionSlotRead,
    MissingAdvisorResponse,
)
from app.services.advisor_service import advisor_service

router = APIRouter()


class AdvisoryRequest(BaseModel):
    project_goal: str
    current_club_ids: List[str] = []


@router.get("/", response_model=List[CoalitionRead])
async def list_coalitions(db: AsyncSession = Depends(get_db)):
    """List all assembled coalitions."""
    stmt = select(Coalition).options(selectinload(Coalition.slots))
    res = await db.execute(stmt)
    coalitions = res.scalars().all()

    # Enrich slot details with club names
    col_stmt = select(College)
    col_res = await db.execute(col_stmt)
    colleges = {c.id: c for c in col_res.scalars().all()}

    output = []
    for c in coalitions:
        slots_read = []
        for s in (c.slots or []):
            club = colleges.get(s.club_id)
            slots_read.append(
                CoalitionSlotRead(
                    id=s.id,
                    coalition_id=s.coalition_id,
                    slot_number=s.slot_number,
                    role=s.role,
                    covered_capability=s.covered_capability,
                    club_id=s.club_id,
                    club_name=club.name if club else None,
                    institution=club.institution if club else None,
                )
            )
        output.append(
            CoalitionRead(
                id=c.id,
                title=c.title,
                project_goal=c.project_goal,
                status=c.status,
                created_at=c.created_at,
                slots=slots_read,
            )
        )
    return output


@router.post("/", response_model=CoalitionRead, status_code=status.HTTP_201_CREATED)
async def create_coalition(
    payload: CoalitionCreate,
    db: AsyncSession = Depends(get_db),
):
    """Assemble a multi-party coalition with slot roles."""
    coalition_id = f"coalition-{str(uuid.uuid4())[:8]}"
    coalition = Coalition(
        id=coalition_id,
        title=payload.title,
        project_goal=payload.project_goal,
        status=payload.status or "Drafting",
    )
    db.add(coalition)
    await db.flush()

    slots_read = []
    for s in payload.slots:
        slot_id = f"slot-{str(uuid.uuid4())[:8]}"
        new_slot = CoalitionSlot(
            id=slot_id,
            coalition_id=coalition_id,
            slot_number=s.slot_number,
            role=s.role,
            covered_capability=s.covered_capability,
            club_id=s.club_id,
        )
        db.add(new_slot)

    await db.commit()
    await db.refresh(coalition)

    # Fetch fresh with relations
    stmt = select(Coalition).where(Coalition.id == coalition_id).options(selectinload(Coalition.slots))
    res = await db.execute(stmt)
    fresh_c = res.scalars().first()

    return fresh_c


@router.post("/advisory", response_model=MissingAdvisorResponse)
async def analyze_coalition_requirements(
    payload: AdvisoryRequest,
    db: AsyncSession = Depends(get_db),
    tenant_id: str = Depends(get_current_tenant_id),
):
    """
    Auto-extract capability requirements from project goals and detect missing capability gaps.
    Recommends specific partner labs based on complementary skills and available hours.
    """
    return await advisor_service.analyze_coalition_gaps(
        db=db,
        project_goal=payload.project_goal,
        current_club_ids=payload.current_club_ids,
        tenant_club_id=tenant_id,
    )
