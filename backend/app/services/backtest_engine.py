# File: app/services/backtest_engine.py

import pandas as pd
import pandas_ta as ta
from typing import Dict, Any, List
from app.services.binance_service import get_klines

# -----------------------------
# LOAD PRICE DATA + INDICATORS
# -----------------------------
def load_price_data(asset: str, interval: str, range_value: str) -> pd.DataFrame:
    candles = get_klines(asset, interval, range_value)
    df = pd.DataFrame(candles)

    # ensure timestamp column exists and converted
    df["timestamp"] = pd.to_datetime(df["timestamp"], unit="ms")

    numeric_cols = ["open", "high", "low", "close", "volume"]
    df[numeric_cols] = df[numeric_cols].astype(float)

    return df


def apply_indicators(df: pd.DataFrame) -> pd.DataFrame:
    # RSI (14)
    df["rsi"] = ta.rsi(df["close"], length=14)

    # EMA 20 / 50
    df["ema20"] = ta.ema(df["close"], length=20)
    df["ema50"] = ta.ema(df["close"], length=50)

    # MACD (optional)
    macd = ta.macd(df["close"])
    if macd is not None:
        df["macd"] = macd["MACD_12_26_9"]
        df["signal"] = macd["MACDs_12_26_9"]

    # drop warm-up NaNs
    df.dropna(inplace=True)
    df.reset_index(drop=True, inplace=True)
    return df


# -----------------------------
# RULE CHECKERS (Option A)
# -----------------------------
def check_buy(df: pd.DataFrame, i: int, rule: Dict[str, Any]) -> bool:
    indicator = (rule or {}).get("indicator")
    operator = (rule or {}).get("operator")
    value = (rule or {}).get("value")

    if indicator == "RSI":
        rsi = df.loc[i, "rsi"]
        if operator == "<" and rsi < value:
            return True
        if operator == ">" and rsi > value:
            return True

    if indicator == "EMA20":
        close = df.loc[i, "close"]
        ema = df.loc[i, "ema20"]
        if operator == "<" and close < ema:
            return True
        if operator == ">" and close > ema:
            return True

    return False


def check_sell(df: pd.DataFrame, i: int, rule: Dict[str, Any]) -> bool:
    indicator = (rule or {}).get("indicator")

    # EMA crosses
    if indicator == "EMA20" and rule.get("condition") == "crosses_above":
        prev_close = df.loc[i - 1, "close"]
        prev_ema = df.loc[i - 1, "ema20"]
        close = df.loc[i, "close"]
        ema = df.loc[i, "ema20"]
        return prev_close < prev_ema and close > ema

    if indicator == "EMA20" and rule.get("condition") == "crosses_below":
        prev_close = df.loc[i - 1, "close"]
        prev_ema = df.loc[i - 1, "ema20"]
        close = df.loc[i, "close"]
        ema = df.loc[i, "ema20"]
        return prev_close > prev_ema and close < ema

    # RSI thresholds
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
# BACKTEST ENGINE (Full trade logs, human-friendly timestamps)
# -----------------------------
def run_backtest(asset: str, interval: str, range_value: str, rules: Dict[str, Any]) -> Dict[str, Any]:
    """
    Returns:
    {
      win_ratio, loss_ratio, total_trades, profit_factor,
      equity_curve, final_equity, trades: [ {entry_time, exit_time, entry_price, exit_price, pl_pct, pl_usd} ]
    }
    """
    df = load_price_data(asset, interval, range_value)
    df = apply_indicators(df)

    # Engine state
    in_trade = False
    entry_price = None
    entry_index = None
    trades: List[Dict[str, Any]] = []
    equity = 10000.0  # starting capital (MVP default)
    equity_curve: List[float] = [equity]

    buy_rule = rules.get("buy", {}) if rules else {}
    sell_rule = rules.get("sell", {}) if rules else {}

    # Iterate through candles
    for i in range(1, len(df)):
        close_price = float(df.loc[i, "close"])

        # ENTER trade
        if not in_trade and check_buy(df, i, buy_rule):
            in_trade = True
            entry_price = close_price
            entry_index = i
            # record but don't finalize until exit
            # continue to next candle
            equity_curve.append(equity)
            continue

        # EXIT trade
        if in_trade and check_sell(df, i, sell_rule):
            exit_price = close_price
            exit_index = i

            # profit percent based on price change
            pl_pct = (exit_price - entry_price) / entry_price
            # USD profit uses **full current equity** per your choice (C)
            pl_usd = equity * pl_pct

            # create human-friendly timestamp strings
            entry_time = df.loc[entry_index, "timestamp"]
            exit_time = df.loc[exit_index, "timestamp"]

            entry_time_str = pd.to_datetime(entry_time).strftime("%Y-%m-%d %H:%M:%S")
            exit_time_str = pd.to_datetime(exit_time).strftime("%Y-%m-%d %H:%M:%S")

            # store trade record
            trade_record = {
                "entry_time": entry_time_str,
                "entry_price": float(entry_price),
                "exit_time": exit_time_str,
                "exit_price": float(exit_price),
                "pl_pct": round(pl_pct, 6),
                "pl_usd": round(pl_usd, 2),
            }
            trades.append(trade_record)

            # update equity using full capitalization of current equity
            equity = equity * (1 + pl_pct)

            # reset trade state
            in_trade = False
            entry_price = None
            entry_index = None

        equity_curve.append(equity)

    # final metrics
    wins = len([t for t in trades if t["pl_pct"] > 0])
    losses = len([t for t in trades if t["pl_pct"] <= 0])
    total_trades = len(trades)

    profit_gains = sum([t["pl_pct"] for t in trades if t["pl_pct"] > 0])
    profit_losses = sum([t["pl_pct"] for t in trades if t["pl_pct"] <= 0])

    profit_factor = (profit_gains / abs(profit_losses)) if (profit_losses != 0) else (profit_gains if profit_gains != 0 else 1)

    return {
        "win_ratio": (wins / total_trades) if total_trades else 0,
        "loss_ratio": (losses / total_trades) if total_trades else 0,
        "total_trades": total_trades,
        "profit_factor": round(profit_factor, 3),
        "equity_curve": equity_curve,
        "final_equity": round(equity, 2),
        "trades": trades,
    }
