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
    timeframe: str   # 1m, 5m, 1h, 1d
    range: str        # 7d, 30d, 90d, 6m, 1y


@router.post("/backtest")
def backtest(req: BacktestRequest):
    """
    Main backtest endpoint:
    1. Interpret strategy with Gemini
    2. Clean JSON using our safe parser
    3. Run backtest engine
    4. Return metrics + rules + equity curve
    """

    # ---------------------------
    # 1. Interpret strategy using Gemini
    # ---------------------------
    ai_text = interpret_strategy_with_gemini(req.strategy)
    
    if not ai_text:
        raise HTTPException(status_code=500, detail="Gemini interpretation failed.")

    # ---------------------------
    # 2. Clean / extract JSON rules
    # ---------------------------
    try:
        rules = extract_json(ai_text)
    except Exception as e:
        print("JSON CLEAN ERROR:", e)
        raise HTTPException(status_code=500, detail="Gemini returned invalid JSON format.")


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
    except Exception as e:
        print("BACKTEST ENGINE ERROR:", e)
        raise HTTPException(status_code=500, detail=f"Backtest failed: {str(e)}")


    # ---------------------------
    # 4. Return Response
    # ---------------------------
    return {
        "status": "success",
        "rules": rules,
        "result": result
    }
