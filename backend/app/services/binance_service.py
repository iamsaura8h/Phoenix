# File: app/services/binance_service.py

import requests
import datetime
from app.core.config import settings

BINANCE_BASE = "https://api.binance.com/api/v3/klines"

# Convert a range like "30d" or "1y" into number of candles
def calculate_limit(range_value: str, interval: str):
    if range_value.endswith("d"):
        days = int(range_value.replace("d", ""))
        total_minutes = days * 24 * 60

    elif range_value.endswith("m"):  # months
        months = int(range_value.replace("m", ""))
        days = months * 30
        total_minutes = days * 24 * 60

    elif range_value.endswith("y"):
        years = int(range_value.replace("y", ""))
        days = years * 365
        total_minutes = days * 24 * 60

    else:
        raise ValueError("Invalid range format. Use 7d, 30d, 90d, 6m, 1y, etc.")

    interval_map = {
        "1m": 1,
        "5m": 5,
        "15m": 15,
        "1h": 60,
        "4h": 240,
        "1d": 1440,
    }

    minutes_per_candle = interval_map.get(interval)
    if minutes_per_candle is None:
        raise ValueError("Invalid interval.")

    return min(total_minutes // minutes_per_candle, 1000)  # Binance max limit=1000


def get_klines(symbol: str, interval: str, range_value: str):
    """Fetch historical candles from Binance"""

    limit = calculate_limit(range_value, interval)

    params = {
        "symbol": f"{symbol}USDT",
        "interval": interval,
        "limit": limit,
    }

    # 🚀 FIX: Add headers so Binance doesn't block (418 Teapot)
    headers = {
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
                      "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "*/*",
        "X-MBX-APIKEY": settings.BINANCE_API_KEY
    }

    response = requests.get(BINANCE_BASE, params=params, headers=headers)
    response.raise_for_status()

    raw = response.json()

    candles = []
    for c in raw:
        candles.append({
            "timestamp": c[0],
            "open": float(c[1]),
            "high": float(c[2]),
            "low": float(c[3]),
            "close": float(c[4]),
            "volume": float(c[5]),
        })

    return candles
