import uuid
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlmodel import select
from app.core.database import get_db
from app.api.deps import get_current_organization
from app.models.organization import Organization
from app.models.capability import OrganizationCapability
from app.services.matcher import matcher_service

router = APIRouter()


class CoalitionRequest(BaseModel):
    title: str
    description: str
    required_skills: List[str]


class CoalitionResponse(BaseModel):
    title: str
    project_goal: str
    required_skills_count: int
    satisfied_skills_count: int
    coalition_size: int
    recommended_coalition: List[Dict[str, Any]]
    capability_coverage_map: Dict[str, str]
    missing_capabilities: List[str]
    has_critical_gap: bool
    warning: Optional[str] = None


@router.get("/recommendations/{organization_id}")
async def get_organization_recommendations(
    organization_id: uuid.UUID,
    category: Optional[str] = Query(None, description="Optional category filter"),
    query: Optional[str] = Query(None, description="Optional project goal / objective for semantic alignment"),
    top_k: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    """
    Get ranked matching organization recommendations with transparent mathematical score breakdowns.
    Formula: S(A, B) = 0.35*C + 0.20*G + 0.15*R + 0.15*Av + 0.10*T + 0.05*D
    """
    stmt = (
        select(Organization)
        .where(Organization.id == organization_id)
        .options(
            selectinload(Organization.institution),
            selectinload(Organization.capabilities).selectinload(OrganizationCapability.capability),
        )
    )
    res = await db.execute(stmt)
    tenant = res.scalars().first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Organization not found")

    candidates_with_scores = await matcher_service.get_hybrid_candidates(
        db=db,
        tenant_id=organization_id,
        query=query,
        category=category,
        top_k=top_k,
    )

    results = []
    for cand, score_data in candidates_with_scores:
        offers = [
            {"name": c.capability.name, "type": c.capability.type, "capacity": c.capacity_detail}
            for c in (cand.capabilities or []) if c.direction == "OFFER" and c.capability
        ]
        needs = [
            {"name": c.capability.name, "type": c.capability.type, "capacity": c.capacity_detail}
            for c in (cand.capabilities or []) if c.direction == "NEED" and c.capability
        ]

        results.append({
            "id": cand.id,
            "name": cand.name,
            "slug": cand.slug,
            "institution_name": cand.institution.name if cand.institution else "Partner University",
            "institution_domain": cand.institution.domain if cand.institution else "ac.in",
            "category": cand.category,
            "description": cand.description,
            "verification_tier": cand.verification_tier,
            "weekly_available_hours": cand.weekly_available_hours,
            "trust_score": cand.trust_score,
            "is_overlooked": cand.is_overlooked,
            "avatar_url": cand.avatar_url,
            "score": score_data["score"],
            "composite_percent": score_data["composite_percent"],
            "breakdown": score_data["breakdown"],
            "rationale": score_data["rationale"],
            "offers": offers,
            "needs": needs,
        })

    return {
        "tenant_id": tenant.id,
        "tenant_name": tenant.name,
        "total_recommendations": len(results),
        "recommendations": results,
    }


@router.post("/coalition", response_model=CoalitionResponse)
async def generate_coalition(
    payload: CoalitionRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    N-Party Coalition Builder (Greedy Heuristic):
    Accepts project goal and required skills, builds the optimal multi-club coalition,
    and flags any missing critical roles/skills.
    """
    return await matcher_service.build_n_party_coalition(
        db=db,
        project_title=payload.title,
        project_goal=payload.description,
        required_skills=payload.required_skills,
    )


@router.get("/matches")
async def get_match_feed(
    query: Optional[str] = Query(None, description="Semantic keyword search or project objective"),
    category: Optional[str] = Query(None, description="Filter by category"),
    top_k: int = Query(20, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
    tenant: Organization = Depends(get_current_organization),
):
    """General explorer match feed for the authenticated or active tenant organization."""
    return await get_organization_recommendations(
        organization_id=tenant.id,
        category=category,
        query=query,
        top_k=top_k,
        db=db,
    )
