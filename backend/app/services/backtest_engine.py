# File: app/services/backtest_engine.py

import pandas as pd
import pandas_ta as ta
from app.services.binance_service import get_klines


# -----------------------------
# LOAD PRICE DATA + INDICATORS
# -----------------------------
def load_price_data(asset: str, interval: str, range_value: str):
    candles = get_klines(asset, interval, range_value)
    df = pd.DataFrame(candles)

    df["timestamp"] = pd.to_datetime(df["timestamp"], unit="ms")
    df["open"] = pd.to_numeric(df["open"])
    df["high"] = pd.to_numeric(df["high"])
    df["low"] = pd.to_numeric(df["low"])
    df["close"] = pd.to_numeric(df["close"])
    df["volume"] = pd.to_numeric(df["volume"])
    return df


def apply_indicators(df: pd.DataFrame):
    df["rsi"] = ta.rsi(df["close"], length=14)
    df["ema20"] = ta.ema(df["close"], length=20)
    df["ema50"] = ta.ema(df["close"], length=50)

    macd = ta.macd(df["close"])
    if macd is not None:
        df["macd"] = macd["MACD_12_26_9"]
        df["signal"] = macd["MACDs_12_26_9"]

    df.dropna(inplace=True)
    df.reset_index(drop=True, inplace=True)
    return df


# -----------------------------
# RULE CHECKERS (OPTION A)
# -----------------------------
def check_buy(df, i, rule):
    indicator = rule.get("indicator")
    operator = rule.get("operator")
    value = rule.get("value")

    # RSI
    if indicator == "RSI":
        rsi = df.loc[i, "rsi"]
        if operator == "<" and rsi < value:
            return True
        if operator == ">" and rsi > value:
            return True

    # Price relative to EMA20
    if indicator == "EMA20":
        price = df.loc[i, "close"]
        ema = df.loc[i, "ema20"]
        if operator == "<" and price < ema:
            return True
        if operator == ">" and price > ema:
            return True

    return False


def check_sell(df, i, rule):
    indicator = rule.get("indicator")

    # crosses above EMA20
    if indicator == "EMA20" and rule.get("condition") == "crosses_above":
        prev_price = df.loc[i - 1, "close"]
        prev_ema = df.loc[i - 1, "ema20"]
        price = df.loc[i, "close"]
        ema = df.loc[i, "ema20"]

        if prev_price < prev_ema and price > ema:
            return True

    # crosses below EMA20
    if indicator == "EMA20" and rule.get("condition") == "crosses_below":
        prev_price = df.loc[i - 1, "close"]
        prev_ema = df.loc[i - 1, "ema20"]
        price = df.loc[i, "close"]
        ema = df.loc[i, "ema20"]

        if prev_price > prev_ema and price < ema:
            return True

    # RSI threshold
    if indicator == "RSI":
        operator = rule.get("operator")
        value = rule.get("value")
        rsi = df.loc[i, "rsi"]
        if operator == ">" and rsi > value:
            return True
        if operator == "<" and rsi < value:
            return True

    return False


# -----------------------------
# BACKTEST ENGINE
# -----------------------------
def run_backtest(asset, interval, range_value, rules):
    df = load_price_data(asset, interval, range_value)
    df = apply_indicators(df)

    in_trade = False
    entry_price = 0
    trades = []
    equity = 10000
    equity_curve = [equity]

    for i in range(1, len(df)):
        price = df.loc[i, "close"]

        # BUY LOGIC
        if not in_trade and check_buy(df, i, rules.get("buy", {})):
            in_trade = True
            entry_price = price
            continue

        # SELL LOGIC
        if in_trade and check_sell(df, i, rules.get("sell", {})):
            profit_pct = (price - entry_price) / entry_price
            equity *= (1 + profit_pct)
            trades.append(profit_pct)
            in_trade = False

        equity_curve.append(equity)

    # Final metrics
    wins = len([t for t in trades if t > 0])
    losses = len([t for t in trades if t <= 0])

    return {
        "win_ratio": wins / len(trades) if trades else 0,
        "loss_ratio": losses / len(trades) if trades else 0,
        "total_trades": len(trades),
        "profit_factor": (sum([t for t in trades if t > 0]) /
                          abs(sum([t for t in trades if t <= 0])) if losses else 1),
        "equity_curve": equity_curve,
        "trades": trades,
        "final_equity": equity,
    }
