from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth,
    organizations,
    matching,
    charters,
    exchange,
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Institutional Authentication"])
api_router.include_router(organizations.router, prefix="/organizations", tags=["Organizations & Capability Ledgers"])
api_router.include_router(matching.router, prefix="/matching", tags=["Algorithmic Complementarity Engine"])
api_router.include_router(charters.router, prefix="/charters", tags=["Multi-Sig Project Charters"])
api_router.include_router(exchange.router, prefix="/exchange", tags=["Spot Market & Equipment Exchange"])
