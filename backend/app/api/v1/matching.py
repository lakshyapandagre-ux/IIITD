from typing import Optional, List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlmodel import select
from app.core.database import get_db
from app.api.deps import get_current_tenant
from app.models.college import College
from app.schemas.match import MatchResponse, MatchCandidate, ScoreBreakdown
from app.services.matching_service import matching_engine

router = APIRouter()


@router.get("/matches", response_model=MatchResponse)
async def get_match_feed(
    query: Optional[str] = Query(None, description="Semantic keyword search or project objective"),
    domain: Optional[str] = Query(None, description="Filter by engineering domain: Robotics, AI, Biotech, Design, Hardware, Energy"),
    exploration_boost: bool = Query(True, description="Enable 1.15x visibility boost for overlooked regional labs"),
    db: AsyncSession = Depends(get_db),
    tenant: College = Depends(get_current_tenant),
):
    """
    Algorithmic Complementarity Engine matching feed.
    Evaluates S(A, B) = w1*C + w2*G + w3*R + w4*T with Exploration Boost.
    """
    stmt = (
        select(College)
        .where(College.id != tenant.id)
        .options(
            selectinload(College.offers),
            selectinload(College.needs)
        )
    )

    if domain and domain.lower() != "all":
        stmt = stmt.where(College.domain == domain)

    res = await db.execute(stmt)
    candidates_raw = res.scalars().all()

    evaluated_candidates: List[MatchCandidate] = []

    for cand in candidates_raw:
        # Calculate full S(A, B) breakdown
        scores = matching_engine.evaluate_pair(
            tenant=tenant,
            candidate=cand,
            query=query,
            enable_exploration_boost=exploration_boost,
        )

        offers_data = [
            {"title": o.title, "category": o.category, "capacity": o.capacity, "tags": o.tags}
            for o in (cand.offers or [])
        ]
        needs_data = [
            {"title": n.title, "category": n.category, "urgency": n.urgency}
            for n in (cand.needs or [])
        ]

        evaluated_candidates.append(
            MatchCandidate(
                club_id=cand.id,
                name=cand.name,
                institution=cand.institution,
                campus_code=cand.campus_code,
                domain=cand.domain,
                verification_status=cand.verification_status,
                domain_attestation=cand.domain_attestation,
                faculty_poc=cand.faculty_poc,
                avatar_url=cand.avatar_url,
                scores=scores,
                is_overlooked=cand.is_overlooked,
                offers=offers_data,
                needs=needs_data,
                active_projects_count=3,
                completed_charters_count=7,
                weekly_available_hours=cand.weekly_available_hours,
            )
        )

    # Sort candidates descending by composite score S(A, B)
    evaluated_candidates.sort(key=lambda c: c.scores.composite, reverse=True)

    return MatchResponse(
        tenant_club_id=tenant.id,
        total_candidates=len(evaluated_candidates),
        exploration_boost_active=exploration_boost,
        candidates=evaluated_candidates,
    )
