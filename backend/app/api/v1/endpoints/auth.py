from datetime import timedelta
from typing import Optional
from pydantic import BaseModel, EmailStr
from fastapi import APIRouter, HTTPException, status
from app.core.config import settings
from app.core.security import create_access_token, is_valid_institutional_domain

router = APIRouter()


class InstitutionalLoginRequest(BaseModel):
    email: str
    organization_slug: Optional[str] = "iit-indore-robotics"
    password: Optional[str] = "password"


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in_minutes: int
    is_accredited_domain: bool
    domain: str


class DomainVerificationRequest(BaseModel):
    domain_or_email: str


class DomainVerificationResponse(BaseModel):
    domain: str
    is_accredited: bool
    status: str


@router.post("/login", response_model=TokenResponse)
async def login_with_institutional_email(payload: InstitutionalLoginRequest):
    """
    Authenticate a club lead or faculty advisor with an accredited university domain (.edu / .ac.in).
    """
    if not is_valid_institutional_domain(payload.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Domain attestation rejected. Login requires an accredited institutional email (.edu, .ac.in, or .edu.in)."
        )

    domain = payload.email.split("@")[-1] if "@" in payload.email else payload.email
    access_token = create_access_token(
        subject=payload.email,
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in_minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES,
        is_accredited_domain=True,
        domain=domain,
    )


@router.post("/verify-domain", response_model=DomainVerificationResponse)
async def verify_domain(payload: DomainVerificationRequest):
    """
    Check if a university domain or student/faculty email passes institutional accreditation attestation.
    """
    domain = payload.domain_or_email.split("@")[-1] if "@" in payload.domain_or_email else payload.domain_or_email
    is_valid = is_valid_institutional_domain(domain)
    
    return DomainVerificationResponse(
        domain=domain,
        is_accredited=is_valid,
        status="Verified University Network Partner" if is_valid else "Unaccredited Domain"
    )
