import uuid
from typing import AsyncGenerator, Optional
from fastapi import Header, HTTPException, status, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlmodel import select
from app.core.database import get_db
from app.models.organization import Organization
from app.models.institution import Institution


async def get_current_organization_slug(
    x_organization_slug: Optional[str] = Header(default="iit-indore-robotics")
) -> str:
    """Header dependency for current tenant organization slug."""
    return x_organization_slug or "iit-indore-robotics"


async def get_current_organization(
    db: AsyncSession = Depends(get_db),
    slug: str = Depends(get_current_organization_slug),
) -> Organization:
    """Fetches tenant organization context from database."""
    stmt = (
        select(Organization)
        .where(Organization.slug == slug)
        .options(
            selectinload(Organization.institution),
            selectinload(Organization.capabilities),
        )
    )
    res = await db.execute(stmt)
    org = res.scalars().first()
    if not org:
        # Fallback to the first available organization
        fallback_stmt = (
            select(Organization)
            .options(
                selectinload(Organization.institution),
                selectinload(Organization.capabilities),
            )
            .limit(1)
        )
        fallback_res = await db.execute(fallback_stmt)
        org = fallback_res.scalars().first()
        if not org:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Organization context '{slug}' not found. Ensure initial data has been seeded."
            )
    return org
