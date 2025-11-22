# File: app/routes/strategy.py

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.gemini_service import interpret_strategy_with_gemini
import json
from app.utils.json_cleaner import extract_json

router = APIRouter()

class StrategyRequest(BaseModel):
    strategy: str

@router.post("/strategy/interpret")
def interpret_strategy(req: StrategyRequest):
    """Convert user strategy into structured buy/sell rules using Gemini."""

    ai_text = interpret_strategy_with_gemini(req.strategy)

    if not ai_text:
        raise HTTPException(status_code=500, detail="Failed to interpret strategy with Gemini.")

    # Try to parse JSON from AI response
    try:
        rules = extract_json(ai_text)
    except Exception as e:
        print("JSON cleaner: ",e)
        raise HTTPException(status_code=500, detail="Gemini returned invalid JSON format.")

    return {
        "status": "success",
        "rules": rules
    }
