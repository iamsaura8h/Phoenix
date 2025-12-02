# File: app/routes/strategy.py

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.gemini_service import validate_strategy_with_gemini

router = APIRouter()

class StrategyRequest(BaseModel):
    strategy: str

@router.post("/strategy/validate")
def validate_strategy(req: StrategyRequest):
    """Validate user strategy using Gemini. Gemini decides valid/invalid and provides suggestions."""

    result = validate_strategy_with_gemini(req.strategy)

    if not result:
        raise HTTPException(status_code=500, detail="Gemini failed to validate strategy")

    return result
