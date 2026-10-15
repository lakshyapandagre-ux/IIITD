import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlmodel import select
from app.core.database import get_db
from app.models.exchange import ExchangeItem, Reservation
from app.models.organization import Organization
from app.schemas.exchange import (
    ExchangeItemCreate,
    ExchangeItemRead,
    ReservationCreate,
    ReservationRead,
)

router = APIRouter()


@router.get("/items", response_model=List[ExchangeItemRead])
async def list_exchange_items(
    category: Optional[str] = Query(None, description="Hardware, Space, Compute, Wind Tunnel"),
    db: AsyncSession = Depends(get_db),
):
    """List lab equipment and testing facilities available for time-share."""
    stmt = (
        select(ExchangeItem)
        .options(
            selectinload(ExchangeItem.organization).selectinload(Organization.institution),
            selectinload(ExchangeItem.reservations),
        )
    )
    if category and category.lower() != "all":
        stmt = stmt.where(ExchangeItem.category == category)

    res = await db.execute(stmt)
    items = res.scalars().all()

    output = []
    for item in items:
        resvs = [ReservationRead.model_validate(r) for r in (item.reservations or [])]
        output.append(
            ExchangeItemRead(
                id=item.id,
                organization_id=item.organization_id,
                organization_name=item.organization.name if item.organization else "Lab Facility",
                institution_name=item.organization.institution.name if item.organization and item.organization.institution else "Partner University",
                title=item.title,
                type=item.type,
                category=item.category,
                lab_name=item.lab_name,
                availability=item.availability,
                faculty_poc=item.faculty_poc,
                description=item.description,
                specs=item.specs,
                capacity=item.capacity,
                status=item.status,
                image_url=item.image_url,
                created_at=item.created_at,
                reservations=resvs,
            )
        )
    return output


@router.post("/items", response_model=ExchangeItemRead, status_code=status.HTTP_201_CREATED)
async def create_exchange_item(
    payload: ExchangeItemCreate,
    db: AsyncSession = Depends(get_db),
):
    """List a new piece of specialized lab equipment for spot market time-sharing."""
    item = ExchangeItem(**payload.dict())
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item


@router.post("/reservations", response_model=ReservationRead, status_code=status.HTTP_201_CREATED)
async def create_reservation(
    payload: ReservationCreate,
    db: AsyncSession = Depends(get_db),
):
    """Reserve a time slot for specialized lab equipment with institutional attestation."""
    stmt = select(ExchangeItem).where(ExchangeItem.id == payload.item_id)
    res = await db.execute(stmt)
    item = res.scalars().first()
    if not item:
        raise HTTPException(status_code=404, detail="Exchange item not found")

    reservation = Reservation(
        item_id=payload.item_id,
        reserved_by_institution=payload.reserved_by_institution,
        reserved_date=payload.reserved_date,
        time_slot=payload.time_slot,
        scope_of_use=payload.scope_of_use,
        status="Confirmed",
    )
    db.add(reservation)
    await db.commit()
    await db.refresh(reservation)
    return reservation


@router.get("/reservations", response_model=List[ReservationRead])
async def list_reservations(db: AsyncSession = Depends(get_db)):
    """List all lab spot market reservations."""
    stmt = select(Reservation)
    res = await db.execute(stmt)
    return res.scalars().all()
