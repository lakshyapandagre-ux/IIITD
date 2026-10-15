import math
import numpy as np
from typing import List, Optional, Tuple, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from app.core.config import settings
from app.models.college import College
from app.models.capability import CapabilityOffer, CapabilityNeed
from app.schemas.match import ScoreBreakdown, MatchCandidate, MatchResponse


def generate_text_embedding(text: str, dim: int = 384) -> List[float]:
    """
    Generate normalized 384-dimensional pseudo-semantic embedding vector
    based on character n-grams and hashed tokens for fast deterministic semantic search
    without requiring heavy PyTorch/CUDA runtime dependencies.
    """
    if not text:
        return [0.0] * dim
    
    vec = np.zeros(dim, dtype=np.float32)
    words = text.lower().replace("-", " ").replace("_", " ").split()
    
    for i, word in enumerate(words):
        # Hash tokens into vector bins
        h = hash(word)
        idx1 = abs(h) % dim
        idx2 = abs(h >> 5) % dim
        idx3 = abs(h >> 11) % dim
        
        weight = 1.0 / (1.0 + 0.1 * i)
        vec[idx1] += weight * 1.5
        vec[idx2] += weight * 0.8
        vec[idx3] -= weight * 0.5
        
        # Character 3-grams
        for j in range(len(word) - 2):
            gram = word[j:j+3]
            g_idx = abs(hash(gram)) % dim
            vec[g_idx] += 0.3
            
    # L2 normalize
    norm = np.linalg.norm(vec)
    if norm > 1e-6:
        vec = vec / norm
    return vec.tolist()


def cosine_similarity(v1: List[float], v2: List[float]) -> float:
    """Compute cosine similarity between two float vectors."""
    if not v1 or not v2 or len(v1) != len(v2):
        return 0.0
    a = np.array(v1, dtype=np.float32)
    b = np.array(v2, dtype=np.float32)
    dot = np.dot(a, b)
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)
    if norm_a < 1e-6 or norm_b < 1e-6:
        return 0.0
    return float(dot / (norm_a * norm_b))


class MatchingEngine:
    @staticmethod
    def calculate_skill_complementarity(
        tenant_needs: List[str],
        candidate_offers: List[str],
        tenant_offers: List[str],
        candidate_needs: List[str],
    ) -> Tuple[int, str]:
        """
        Skill Complementarity C in [0, 100].
        Measures bidirectional synergy: does candidate offer what tenant needs,
        and does tenant offer what candidate needs?
        """
        if not tenant_needs and not candidate_offers:
            return 75, "Standard domain complementarity"

        t_needs_set = set(n.lower().strip() for n in tenant_needs)
        c_offers_set = set(o.lower().strip() for o in candidate_offers)
        
        # Direct & partial matches
        direct_matches = 0
        for need in t_needs_set:
            for offer in c_offers_set:
                if need in offer or offer in need or any(w in offer for w in need.split() if len(w) > 3):
                    direct_matches += 1
                    break

        # Reverse synergy
        t_offers_set = set(o.lower().strip() for o in tenant_offers)
        c_needs_set = set(n.lower().strip() for n in candidate_needs)
        reverse_matches = 0
        for need in c_needs_set:
            for offer in t_offers_set:
                if need in offer or offer in need or any(w in offer for w in need.split() if len(w) > 3):
                    reverse_matches += 1
                    break

        score_raw = 60 + (direct_matches * 15) + (reverse_matches * 10)
        score = min(98, max(50, score_raw))
        
        rationale = f"Solves {max(1, direct_matches)} active bottleneck(s) with complementary hardware and lab access."
        return score, rationale

    @staticmethod
    def calculate_goal_alignment(
        domain_a: str,
        domain_b: str,
        query: Optional[str] = None,
        candidate_domain: str = ""
    ) -> int:
        """Goal alignment G in [0, 100]."""
        if domain_a.lower() == domain_b.lower():
            base = 92
        elif (domain_a in ["Robotics", "Hardware"] and domain_b in ["AI", "Robotics", "Hardware"]) or \
             (domain_a in ["Biotech", "AI"] and domain_b in ["Biotech", "AI"]):
            base = 88
        else:
            base = 72

        if query:
            q_clean = query.lower()
            if candidate_domain.lower() in q_clean or any(word in q_clean for word in ["autonomous", "drone", "lab", "sensor", "model"]):
                base = min(96, base + 6)

        return base

    @staticmethod
    def calculate_resource_availability(weekly_hours: int) -> int:
        """Resource Availability R in [0, 100]."""
        # 40 hours/week -> 90 score, 50 hours/week -> 95 score
        norm = int(weekly_hours * 2.25)
        return min(98, max(45, norm))

    @staticmethod
    def calculate_trust_score(verification_status: str, trust_score: int, domain_attestation: str) -> int:
        """Verification & Trust T in [0, 100]."""
        base = trust_score
        if "Tier 1" in verification_status:
            base = max(base, 98)
        elif "Tier 2" in verification_status:
            base = max(base, 92)
        if domain_attestation.endswith(".edu") or domain_attestation.endswith(".ac.in"):
            base = min(99, base + 2)
        return min(100, max(50, base))

    @classmethod
    def evaluate_pair(
        cls,
        tenant: College,
        candidate: College,
        query: Optional[str] = None,
        enable_exploration_boost: bool = True,
    ) -> ScoreBreakdown:
        """Compute full S(A, B) = w1*C + w2*G + w3*R + w4*T"""
        t_needs = [n.title for n in tenant.needs] if hasattr(tenant, "needs") and tenant.needs else []
        c_offers = [o.title for o in candidate.offers] if hasattr(candidate, "offers") and candidate.offers else []
        t_offers = [o.title for o in tenant.offers] if hasattr(tenant, "offers") and tenant.offers else []
        c_needs = [n.title for n in candidate.needs] if hasattr(candidate, "needs") and candidate.needs else []

        C, rationale = cls.calculate_skill_complementarity(t_needs, c_offers, t_offers, c_needs)
        G = cls.calculate_goal_alignment(tenant.domain, candidate.domain, query, candidate.domain)
        R = cls.calculate_resource_availability(candidate.weekly_available_hours)
        T = cls.calculate_trust_score(candidate.verification_status, candidate.trust_score, candidate.domain_attestation)

        # S(A, B) = w1*C + w2*G + w3*R + w4*T
        w1 = settings.WEIGHT_COMPLEMENTARITY
        w2 = settings.WEIGHT_GOAL_ALIGNMENT
        w3 = settings.WEIGHT_RESOURCE_AVAILABILITY
        w4 = settings.WEIGHT_TRUST_VERIFICATION

        composite_raw = (w1 * C) + (w2 * G) + (w3 * R) + (w4 * T)

        # Apply Exploration Boost multiplier for overlooked regional colleges
        if enable_exploration_boost and candidate.is_overlooked:
            composite_raw *= settings.EXPLORATION_BOOST_MULTIPLIER
            rationale += " [Exploration Boost: +15% regional lab visibility]"

        composite = min(99, max(40, int(round(composite_raw))))

        return ScoreBreakdown(
            composite=composite,
            skill_complementarity=C,
            goal_alignment=G,
            resource_availability=R,
            verification_trust=T,
            rationale=rationale,
        )


matching_engine = MatchingEngine()
