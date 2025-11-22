# File: app/routes/backtest.py

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.backtest_engine import run_backtest
from app.services.gemini_service import interpret_strategy_with_gemini
from app.utils.json_cleaner import extract_json

router = APIRouter()

class BacktestRequest(BaseModel):
    asset: str
    strategy: str
    timeframe: str
    range: str


@router.post("/backtest")
def backtest(req: BacktestRequest):

    # 1. Interpret strategy (Gemini)
    ai_text = interpret_strategy_with_gemini(req.strategy)
    if not ai_text:
        raise HTTPException(status_code=500, detail="Gemini failed")

    try:
        rules = extract_json(ai_text)
    except:
        raise HTTPException(status_code=500, detail="Invalid strategy JSON")

    # 2. Run backtest
    try:
        result = run_backtest(
            asset=req.asset,
            interval=req.timeframe,
            range_value=req.range,
            rules=rules
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Backtest failed: {str(e)}")

    return {"status": "success", "result": result, "rules": rules}
