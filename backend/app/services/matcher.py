import uuid
from typing import List, Optional, Dict, Any, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlmodel import select, text
from app.models.organization import Organization
from app.models.capability import OrganizationCapability, Capability
from app.models.exchange import ExchangeItem
from app.services.embedding import compute_cosine_similarity, generate_embedding


class MatcherService:
    @staticmethod
    def calculate_directional_skill_coverage(
        tenant_needs: List[str],
        candidate_offers: List[str],
        tenant_offers: List[str],
        candidate_needs: List[str],
    ) -> Tuple[float, str]:
        """
        C (Directional Skill Coverage): [0.0 - 1.0]
        Calculates bidirectional synergy:
        - How many of Tenant's NEEDS are satisfied by Candidate's OFFERS (weight: 0.65)
        - How many of Candidate's NEEDS are satisfied by Tenant's OFFERS (weight: 0.35)
        """
        if not tenant_needs and not candidate_offers:
            return 0.75, "Standard baseline domain complementarity"

        t_needs = [n.lower().strip() for n in tenant_needs]
        c_offers = [o.lower().strip() for o in candidate_offers]

        forward_matches = 0
        matched_tags = []
        for need in t_needs:
            for offer in c_offers:
                if need in offer or offer in need or any(w in offer for w in need.split() if len(w) > 3):
                    forward_matches += 1
                    matched_tags.append(offer)
                    break

        forward_ratio = forward_matches / max(1, len(t_needs))

        t_offers = [o.lower().strip() for o in tenant_offers]
        c_needs = [n.lower().strip() for n in candidate_needs]
        reverse_matches = 0
        for need in c_needs:
            for offer in t_offers:
                if need in offer or offer in need or any(w in offer for w in need.split() if len(w) > 3):
                    reverse_matches += 1
                    break

        reverse_ratio = reverse_matches / max(1, len(c_needs))

        score = min(1.0, max(0.40, (0.65 * forward_ratio) + (0.35 * reverse_ratio) + 0.35))
        rationale = f"Solves {forward_matches} bottleneck(s) ({', '.join(matched_tags[:2]) if matched_tags else 'complementary skills'})"
        return round(score, 3), rationale

    @staticmethod
    def calculate_goal_alignment(
        tenant: Organization,
        candidate: Organization,
        query: Optional[str] = None
    ) -> float:
        """
        G (Goal Alignment): [0.0 - 1.0]
        Cosine similarity between description embeddings and category synergy.
        """
        base = 0.70
        if tenant.category.lower() == candidate.category.lower():
            base = 0.88
        elif (tenant.category in ["Robotics", "Hardware"] and candidate.category in ["AI", "Robotics", "Hardware"]) or \
             (tenant.category in ["Biotech", "AI"] and candidate.category in ["Biotech", "AI"]):
            base = 0.82

        if tenant.description_embedding and candidate.description_embedding:
            sim = compute_cosine_similarity(tenant.description_embedding, candidate.description_embedding)
            base = max(base, (sim + 1.0) / 2.0)

        if query:
            q_emb = generate_embedding(query)
            if candidate.description_embedding:
                q_sim = compute_cosine_similarity(q_emb, candidate.description_embedding)
                base = min(1.0, base + (max(0.0, q_sim) * 0.15))

        return round(min(1.0, max(0.30, base)), 3)

    @staticmethod
    def calculate_resource_match(
        tenant: Organization,
        candidate: Organization,
        candidate_items: List[ExchangeItem]
    ) -> float:
        """
        R (Resource Match): [0.0 - 1.0]
        Availability of physical equipment, hardware benches, or lab test facilities.
        """
        base = 0.65
        if candidate_items and len(candidate_items) > 0:
            base += min(0.30, len(candidate_items) * 0.12)
        if candidate.weekly_available_hours >= 40:
            base += 0.05
        return round(min(1.0, base), 3)

    @staticmethod
    def calculate_availability(
        tenant: Organization,
        candidate: Organization
    ) -> float:
        """
        Av (Availability): [0.0 - 1.0]
        Working hours per week normalized to 50 hrs ceiling.
        """
        hours = candidate.weekly_available_hours
        norm = hours / 50.0
        return round(min(1.0, max(0.40, norm)), 3)

    @staticmethod
    def calculate_trust_score(candidate: Organization) -> float:
        """
        T (Trust Score): [0.0 - 1.0]
        Based on verification tier:
        - faculty_verified = 1.0
        - student_verified = 0.7
        - unverified = 0.3
        And institutional trust score.
        """
        tier_weights = {
            "faculty_verified": 1.0,
            "student_verified": 0.7,
            "unverified": 0.3,
        }
        tier_factor = tier_weights.get(candidate.verification_tier, 0.5)
        raw_trust = (candidate.trust_score / 100.0)
        final_t = (0.60 * tier_factor) + (0.40 * raw_trust)
        return round(min(1.0, max(0.30, final_t)), 3)

    @staticmethod
    def calculate_diversity_bonus(candidate: Organization) -> float:
        """
        D (Diversity Bonus): [0.0 - 1.0]
        Bonus exploration weight for regional institutions or clubs with fewer connections.
        """
        if candidate.is_overlooked:
            return 1.0
        return 0.60

    @classmethod
    def evaluate_pairwise(
        cls,
        tenant: Organization,
        candidate: Organization,
        candidate_items: List[ExchangeItem] = [],
        query: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Exact Mathematical Formula:
        S(A, B) = 0.35 * C + 0.20 * G + 0.15 * R + 0.15 * Av + 0.10 * T + 0.05 * D
        """
        tenant_needs = [
            c.capability.name for c in (tenant.capabilities or []) if c.direction == "NEED" and c.capability
        ]
        candidate_offers = [
            c.capability.name for c in (candidate.capabilities or []) if c.direction == "OFFER" and c.capability
        ]
        tenant_offers = [
            c.capability.name for c in (tenant.capabilities or []) if c.direction == "OFFER" and c.capability
        ]
        candidate_needs = [
            c.capability.name for c in (candidate.capabilities or []) if c.direction == "NEED" and c.capability
        ]

        C, rationale = cls.calculate_directional_skill_coverage(tenant_needs, candidate_offers, tenant_offers, candidate_needs)
        G = cls.calculate_goal_alignment(tenant, candidate, query)
        R = cls.calculate_resource_match(tenant, candidate, candidate_items)
        Av = cls.calculate_availability(tenant, candidate)
        T = cls.calculate_trust_score(candidate)
        D = cls.calculate_diversity_bonus(candidate)

        final_score = (
            0.35 * C +
            0.20 * G +
            0.15 * R +
            0.15 * Av +
            0.10 * T +
            0.05 * D
        )

        final_score = round(min(1.0, max(0.0, final_score)), 3)

        return {
            "score": final_score,
            "composite_percent": int(round(final_score * 100)),
            "breakdown": {
                "skill_complementarity": C,
                "goal_alignment": G,
                "resource_match": R,
                "availability": Av,
                "trust_score": T,
                "diversity_bonus": D,
            },
            "rationale": rationale,
        }

    @classmethod
    async def get_hybrid_candidates(
        cls,
        db: AsyncSession,
        tenant_id: uuid.UUID,
        query: Optional[str] = None,
        category: Optional[str] = None,
        top_k: int = 20,
    ) -> List[Tuple[Organization, Dict[str, Any]]]:
        """
        Hybrid Candidate Retrieval:
        Retrieves candidates, combining vector similarity and relational filters.
        """
        stmt = (
            select(Organization)
            .where(Organization.id != tenant_id)
            .options(
                selectinload(Organization.institution),
                selectinload(Organization.capabilities).selectinload(OrganizationCapability.capability),
                selectinload(Organization.exchange_items),
            )
        )

        if category and category.lower() != "all":
            stmt = stmt.where(Organization.category == category)

        res = await db.execute(stmt)
        candidates = res.scalars().all()

        # Load tenant
        t_stmt = (
            select(Organization)
            .where(Organization.id == tenant_id)
            .options(
                selectinload(Organization.institution),
                selectinload(Organization.capabilities).selectinload(OrganizationCapability.capability),
            )
        )
        t_res = await db.execute(t_stmt)
        tenant = t_res.scalars().first()

        results = []
        for cand in candidates:
            # Relational filter: ignore inactive clubs with zero weekly hours
            if cand.weekly_available_hours <= 0:
                continue

            scores = cls.evaluate_pairwise(
                tenant=tenant,
                candidate=cand,
                candidate_items=cand.exchange_items or [],
                query=query,
            )
            results.append((cand, scores))

        # Sort descending by final score S(A, B)
        results.sort(key=lambda x: x[1]["score"], reverse=True)
        return results[:top_k]

    @classmethod
    async def build_n_party_coalition(
        cls,
        db: AsyncSession,
        project_title: str,
        project_goal: str,
        required_skills: List[str],
        max_coalition_size: int = 4,
    ) -> Dict[str, Any]:
        """
        N-Party Coalition Builder (Greedy Heuristic):
        Iteratively selects the best organization satisfying the most unfulfilled capabilities
        while penalizing coordination friction.
        Flags missing critical roles: e.g. "missing_capabilities": ["Field Testing"].
        """
        stmt = select(Organization).options(
            selectinload(Organization.institution),
            selectinload(Organization.capabilities).selectinload(OrganizationCapability.capability),
        )
        res = await db.execute(stmt)
        all_orgs = res.scalars().all()

        unfulfilled = set(req.lower().strip() for req in required_skills)
        selected_coalition: List[Dict[str, Any]] = []
        coverage_map: Dict[str, str] = {}  # capability -> club_name

        remaining_candidates = list(all_orgs)

        while unfulfilled and remaining_candidates and len(selected_coalition) < max_coalition_size:
            best_cand = None
            best_gain = -1
            best_covered_here = []

            for cand in remaining_candidates:
                # Find offers matching unfulfilled
                cand_offers = [
                    c.capability.name for c in (cand.capabilities or []) if c.direction == "OFFER" and c.capability
                ]

                covered_here = []
                for skill in list(unfulfilled):
                    for off in cand_offers:
                        if skill in off.lower() or off.lower() in skill or any(w in off.lower() for w in skill.split() if len(w) > 3):
                            covered_here.append(skill)
                            break

                # Score gain: newly covered skills minus small size penalty
                coordination_friction = len(selected_coalition) * 0.15
                net_gain = len(covered_here) - coordination_friction + (0.1 * (cand.trust_score / 100.0))

                if net_gain > best_gain and len(covered_here) > 0:
                    best_gain = net_gain
                    best_cand = cand
                    best_covered_here = covered_here

            if not best_cand or not best_covered_here:
                break

            # Assign best candidate
            for s in best_covered_here:
                unfulfilled.discard(s)
                coverage_map[s] = f"{best_cand.name} ({best_cand.institution.name if best_cand.institution else ''})"

            selected_coalition.append({
                "organization_id": best_cand.id,
                "name": best_cand.name,
                "institution": best_cand.institution.name if best_cand.institution else "Partner University",
                "category": best_cand.category,
                "allocated_weekly_hours": best_cand.weekly_available_hours,
                "covered_skills": best_covered_here,
                "verification_tier": best_cand.verification_tier,
                "trust_score": best_cand.trust_score,
            })
            remaining_candidates.remove(best_cand)

        missing_capabilities = [req for req in required_skills if req.lower().strip() in unfulfilled]

        return {
            "title": project_title,
            "project_goal": project_goal,
            "required_skills_count": len(required_skills),
            "satisfied_skills_count": len(required_skills) - len(missing_capabilities),
            "coalition_size": len(selected_coalition),
            "recommended_coalition": selected_coalition,
            "capability_coverage_map": coverage_map,
            "missing_capabilities": missing_capabilities,
            "has_critical_gap": len(missing_capabilities) > 0,
            "warning": (
                f"Missing critical capabilities: {', '.join(missing_capabilities)}"
                if missing_capabilities else None
            ),
        }


matcher_service = MatcherService()
