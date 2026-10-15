import re
from typing import List, Dict, Set
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from app.models.college import College
from app.models.coalition import Coalition
from app.schemas.coalition import MissingAdvisorResponse, MissingAdvisorRecommendation


# Domain capability dictionary
PROJECT_DOMAIN_CAPABILITIES: Dict[str, List[str]] = {
    "drone": [
        "Carbon Fiber CNC Milling",
        "PX4 / ArduPilot Autonomous Flight Firmware",
        "Multispectral Crop Health Vision AI",
        "High-Discharge LiPo Power Architecture",
        "Long-Range LoRa Telemetry & Ground Station",
    ],
    "robot": [
        "ROS2 Nav2 Navigation Stack",
        "Embedded Microcontroller STM32 / FreeRTOS",
        "Custom PCB Motor Driver Hardware",
        "Computer Vision Depth Estimation",
        "Rapid 3D Prototyping & Stress Simulation",
    ],
    "ai": [
        "Distributed GPU Training Infrastructure",
        "Edge TensorRT Quantization & Optimization",
        "Synthetic Dataset Generation & Augmentation",
        "Multi-Modal Sensor Fusion Pipeline",
    ],
    "biotech": [
        "PCR / Gel Electrophoresis Laboratory Access",
        "CRISPR Guide RNA Sequence Simulation",
        "Bioreactor Fermentation Parameter Control",
        "Microfluidics Chip Prototyping",
    ],
    "energy": [
        "Battery Thermal Management System (BTMS)",
        "CAN Bus Telemetry Data Logger",
        "Regenerative Braking Dynamometer Testing",
        "Solid-State Inverter Power Electronics",
    ],
}


class AdvisorService:
    @staticmethod
    def extract_expected_capabilities(project_goal: str) -> List[str]:
        goal_lower = project_goal.lower()
        capabilities: List[str] = []

        matched_any = False
        for key, cap_list in PROJECT_DOMAIN_CAPABILITIES.items():
            if key in goal_lower:
                capabilities.extend(cap_list)
                matched_any = True

        if not matched_any:
            # Fallback general multi-disciplinary requirements
            capabilities = [
                "Hardware Prototyping & CNC Machining",
                "Embedded Edge AI Firmware Integration",
                "Validation & Institutional Testing Environment",
            ]

        # Return unique set preserving order
        seen = set()
        unique_caps = []
        for c in capabilities:
            if c not in seen:
                seen.add(c)
                unique_caps.append(c)
        return unique_caps

    @classmethod
    async def analyze_coalition_gaps(
        cls,
        db: AsyncSession,
        project_goal: str,
        current_club_ids: List[str],
        tenant_club_id: str,
    ) -> MissingAdvisorResponse:
        expected = cls.extract_expected_capabilities(project_goal)
        
        # Fetch current participating colleges and their offers
        covered_capabilities: Set[str] = set()
        all_colleges_stmt = select(College)
        all_colleges_res = await db.execute(all_colleges_stmt)
        all_colleges = all_colleges_res.scalars().all()

        colleges_by_id = {c.id: c for c in all_colleges}

        all_participating_ids = set(current_club_ids)
        if tenant_club_id:
            all_participating_ids.add(tenant_club_id)

        for cid in all_participating_ids:
            col = colleges_by_id.get(cid)
            if col and hasattr(col, "offers") and col.offers:
                for off in col.offers:
                    covered_capabilities.add(off.title.lower())

        # Determine missing capabilities
        missing_capabilities: List[str] = []
        for exp in expected:
            is_covered = any(
                exp.lower() in cov or cov in exp.lower() or
                any(w in cov for w in exp.lower().split() if len(w) > 4)
                for cov in covered_capabilities
            )
            if not is_covered:
                missing_capabilities.append(exp)

        # Generate recommendations from external colleges
        recommendations: List[MissingAdvisorRecommendation] = []
        candidate_colleges = [c for c in all_colleges if c.id not in all_participating_ids]

        for missing in missing_capabilities[:3]:  # Top 3 critical bottlenecks
            # Find candidate that has the closest matching offer
            best_candidate = None
            highest_score = 0
            best_rationale = ""

            for cand in candidate_colleges:
                match_score = 65
                rationale = f"Offers lab capacity and expertise to fulfill {missing}."
                
                # Check candidate's offers
                if hasattr(cand, "offers") and cand.offers:
                    for off in cand.offers:
                        if any(w in off.title.lower() for w in missing.lower().split() if len(w) > 3):
                            match_score += 25
                            rationale = f"Specifically holds verified '{off.title}' capacity with {cand.weekly_available_hours} hrs/week available."
                            break

                if cand.is_overlooked:
                    match_score += 5
                    rationale += " [Regional Lab Exploration Boost]"

                if match_score > highest_score:
                    highest_score = min(99, match_score)
                    best_candidate = cand
                    best_rationale = rationale

            if best_candidate:
                recommendations.append(
                    MissingAdvisorRecommendation(
                        missing_capability=missing,
                        urgency="Blocker" if len(recommendations) == 0 else "High",
                        best_match_club_id=best_candidate.id,
                        best_match_club_name=best_candidate.name,
                        institution=best_candidate.institution,
                        complementarity_score=highest_score,
                        rationale=best_rationale,
                        weekly_available_hours=best_candidate.weekly_available_hours,
                    )
                )

        return MissingAdvisorResponse(
            project_goal=project_goal,
            analyzed_slots_count=len(current_club_ids),
            missing_capabilities=missing_capabilities,
            recommendations=recommendations,
        )


advisor_service = AdvisorService()
