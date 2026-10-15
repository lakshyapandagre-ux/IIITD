import hashlib
import time
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from app.models.charter import Charter, CharterSignatory, Milestone
from app.core.security import generate_proof_hash


class CryptoService:
    @staticmethod
    def generate_contract_hash(charter_id: str, title: str, signatory_ids: List[str]) -> str:
        payload = f"{charter_id}:{title}:{','.join(sorted(signatory_ids))}:{time.time()}"
        sha = hashlib.sha256(payload.encode()).hexdigest()
        return f"0x{sha[:40]}"

    @classmethod
    async def sign_charter(
        cls,
        db: AsyncSession,
        charter: Charter,
        club_id: str,
        signatory_name: str,
    ) -> Charter:
        signed_any = False
        all_signed = True
        
        for sig in charter.signatories:
            if sig.club_id == club_id:
                sig.signed = True
                sig.signatory_name = signatory_name
                sig.signed_at = time.strftime("%Y-%m-%d %H:%M:%S")
                signed_any = True
            if not sig.signed:
                all_signed = False

        if signed_any and all_signed:
            charter.escrow_status = "Active"
            sig_ids = [s.club_id for s in charter.signatories]
            charter.contract_hash = cls.generate_contract_hash(charter.id, charter.title, sig_ids)

        await db.commit()
        await db.refresh(charter)
        return charter

    @classmethod
    async def record_milestone_verification(
        cls,
        db: AsyncSession,
        milestone: Milestone,
        verifier_institution: str,
    ) -> Milestone:
        verified_by = list(milestone.verified_by or [])
        if verifier_institution not in verified_by:
            verified_by.append(verifier_institution)
            milestone.verified_by = verified_by

        # If threshold met, verify and mint cryptographic proof
        if len(verified_by) >= milestone.required_signatures:
            milestone.status = "Verified Proof"
            milestone.proof_hash = generate_proof_hash(
                milestone.id or "ms-01",
                milestone.proof_url or "https://artifacts.nexuscollab.org/proof",
                verified_by,
            )

        await db.commit()
        await db.refresh(milestone)
        return milestone


crypto_service = CryptoService()
