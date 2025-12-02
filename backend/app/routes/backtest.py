# File: app/routes/backtest.py

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.backtest_engine import run_backtest
from app.services.gemini_service import validate_strategy_with_gemini

router = APIRouter()


class BacktestRequest(BaseModel):
    asset: str
    strategy: str
    timeframe: str   # e.g. "1m", "5m", "1h", "1d"
    range: str       # e.g. "7d", "30d", "6m", "1y"


@router.post("/backtest")
def backtest(req: BacktestRequest):
    """
    1. Validate & interpret strategy using Gemini
    2. Ensure rules object is clean (buy/sell always exist)
    3. Run the backtest engine
    4. Return performance metrics + rules + trade log + equity curve
    """

    # ---------------------------
    # 1. Validate strategy using Gemini
    # ---------------------------
    ai_response = validate_strategy_with_gemini(req.strategy)

    if not ai_response:
        raise HTTPException(status_code=500, detail="Gemini validation failed.")

    # If Gemini says strategy is invalid
    if ai_response.get("valid") is False:
        return {
            "status": "invalid_strategy",
            "error": ai_response.get("error"),
            "suggestions": ai_response.get("suggestions", []),
            "rules": ai_response.get("rules", {"buy": {}, "sell": {}}),
        }

    # ---------------------------
    # 2. SAFE rule extraction
    # ---------------------------
    rules = ai_response.get("rules", {})

    # If somehow Gemini returned a list → reject safely
    if not isinstance(rules, dict):
        raise HTTPException(
            status_code=400,
            detail="Gemini returned rules in an unexpected format (expected an object)."
        )

    # Ensure essential keys exist
    rules.setdefault("buy", {})
    rules.setdefault("sell", {})

    # ---------------------------
    # 3. Run Backtest Engine
    # ---------------------------
    try:
        result = run_backtest(
            asset=req.asset,
            interval=req.timeframe,
            range_value=req.range,
            rules=rules
        )
    except Exception as exc:
        print("BACKTEST ENGINE ERROR:", exc)
        raise HTTPException(status_code=500, detail=f"Backtest failed: {str(exc)}")

    # ---------------------------
    # 4. Return full backtest data
    # ---------------------------
    return {
        "status": "success",
        "rules": rules,
        "result": result,
    }
