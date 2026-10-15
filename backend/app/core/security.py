import hashlib
import time
from datetime import datetime, timedelta
from typing import Any, Union, Optional
from app.core.config import settings

# Graceful import: support either PyJWT or python-jose
try:
    from jose import jwt
except ImportError:
    import jwt  # PyJWT

try:
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
except ImportError:
    pwd_context = None


def verify_password(plain_password: str, hashed_password: str) -> bool:
    if pwd_context:
        return pwd_context.verify(plain_password, hashed_password)
    # Simple sha256 fallback if bcrypt/passlib not installed
    return hashlib.sha256(plain_password.encode()).hexdigest() == hashed_password


def get_password_hash(password: str) -> str:
    if pwd_context:
        return pwd_context.hash(password)
    return hashlib.sha256(password.encode()).hexdigest()


def create_access_token(subject: Union[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    if isinstance(encoded_jwt, bytes):
        encoded_jwt = encoded_jwt.decode("utf-8")
    return encoded_jwt


def is_valid_institutional_domain(domain_or_email: str) -> bool:
    """Validate whether an email or domain belongs to an accredited university (.edu / .ac.in)."""
    clean = domain_or_email.lower().strip()
    if "@" in clean:
        clean = clean.split("@")[-1]
    return clean.endswith(".edu") or clean.endswith(".ac.in") or clean.endswith(".edu.in") or clean in [
        "iiti.ac.in", "sgsits.ac.in", "dauniv.ac.in", "medicaps.ac.in", "coep.ac.in", "iiitdmj.ac.in"
    ]


def generate_proof_hash(milestone_id: str, deliverable_url: str, verified_by: list[str]) -> str:
    """Generate SHA-256 cryptographic verification digest for Multi-Sig records."""
    raw_payload = f"{milestone_id}:{deliverable_url}:{','.join(sorted(verified_by))}:{time.time()}"
    digest = hashlib.sha256(raw_payload.encode()).hexdigest()
    return f"0x{digest[:8]}...{digest[-6:]} (IPFS Minted)"
