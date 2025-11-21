# File: app/routes/binance_test.py

from fastapi import APIRouter, HTTPException, Query
from app.services.binance_service import get_klines

router = APIRouter()

@router.get("/binance/test")
def test_binance_data(
    asset: str = Query(..., description="Asset symbol, e.g. BTC, ETH"),
    interval: str = Query(..., description="Timeframe: 1m, 5m, 15m, 1h, 4h, 1d"),
    range_value: str = Query(..., alias="range", description="Data range: 7d, 30d, 90d, 6m, 1y")
):
    """
    Test endpoint to verify Binance fetcher is working.
    Example:
    /api/binance/test?asset=BTC&interval=1h&range=30d
    """

    try:
        candles = get_klines(asset, interval, range_value)
        return {
            "status": "success",
            "count": len(candles),
            "sample": candles[:5],   # return first 5 candles only
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
