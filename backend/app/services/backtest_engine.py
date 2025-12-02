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

    df["timestamp"] = pd.to_datetime(df["timestamp"], unit="ms")

    numeric_cols = ["open", "high", "low", "close", "volume"]
    df[numeric_cols] = df[numeric_cols].astype(float)

    return df


def apply_indicators(df: pd.DataFrame) -> pd.DataFrame:
    # RSI
    df["rsi"] = ta.rsi(df["close"], length=14)

    # EMA
    df["ema20"] = ta.ema(df["close"], length=20)
    df["ema50"] = ta.ema(df["close"], length=50)
    df["ema100"] = ta.ema(df["close"], length=100)
    df["ema200"] = ta.ema(df["close"], length=200)

    # SMA
    for period in [10, 20, 50, 100, 200]:
        df[f"sma{period}"] = ta.sma(df["close"], length=period)

    # MACD
    macd = ta.macd(df["close"])
    if macd is not None:
        df["macd"] = macd["MACD_12_26_9"]
        df["signal"] = macd["MACDs_12_26_9"]
        df["histogram"] = macd["MACDh_12_26_9"]

    df.dropna(inplace=True)
    df.reset_index(drop=True, inplace=True)
    return df


# -----------------------------
# UNIVERSAL RULE CHECKER
# -----------------------------
def check_condition(df: pd.DataFrame, i: int, rule: Dict[str, Any]) -> bool:
    """
    Universal condition checker that handles ALL indicator types and conditions.
    Works for both buy and sell rules.
    """
    if not rule or i < 1:
        return False

    indicator = rule.get("indicator", "").upper()
    condition = rule.get("condition", rule.get("operator", ""))
    value = rule.get("value")
    compare_to = rule.get("compare_to", "").upper()

    # -----------------------------
    # RSI CONDITIONS
    # -----------------------------
    if indicator == "RSI":
        rsi = df.loc[i, "rsi"]
        
        if condition == "<" or condition == "less_than" or condition == "below":
            return rsi < value
        if condition == ">" or condition == "greater_than" or condition == "above":
            return rsi > value
        if condition == "crosses_above":
            prev_rsi = df.loc[i - 1, "rsi"]
            return prev_rsi < value and rsi > value
        if condition == "crosses_below":
            prev_rsi = df.loc[i - 1, "rsi"]
            return prev_rsi > value and rsi < value

    # -----------------------------
    # EMA CONDITIONS
    # -----------------------------
    if indicator in ["EMA20", "EMA50", "EMA100", "EMA200"]:
        ema_col = indicator.lower()
        if ema_col not in df.columns:
            return False
            
        close = df.loc[i, "close"]
        ema = df.loc[i, ema_col]
        
        # Price vs EMA
        if condition == "<" or condition == "below":
            return close < ema
        if condition == ">" or condition == "above":
            return close > ema
        
        # Price crosses EMA
        if condition == "crosses_above":
            prev_close = df.loc[i - 1, "close"]
            prev_ema = df.loc[i - 1, ema_col]
            return prev_close < prev_ema and close > ema
        if condition == "crosses_below":
            prev_close = df.loc[i - 1, "close"]
            prev_ema = df.loc[i - 1, ema_col]
            return prev_close > prev_ema and close < ema
        
        # EMA vs EMA crossover
        if compare_to and compare_to in ["EMA20", "EMA50", "EMA100", "EMA200"]:
            compare_col = compare_to.lower()
            if compare_col not in df.columns:
                return False
                
            ema2 = df.loc[i, compare_col]
            prev_ema = df.loc[i - 1, ema_col]
            prev_ema2 = df.loc[i - 1, compare_col]
            
            if condition == "crosses_above":
                return prev_ema < prev_ema2 and ema > ema2
            if condition == "crosses_below":
                return prev_ema > prev_ema2 and ema < ema2

    # -----------------------------
    # SMA CONDITIONS (Price crosses SMA)
    # -----------------------------
    if indicator == "PRICE" and rule.get("moving_average"):
        ma = rule.get("moving_average", {})
        period = ma.get("period")
        
        if not period:
            return False
            
        sma_col = f"sma{period}"
        if sma_col not in df.columns:
            return False
            
        close = df.loc[i, "close"]
        sma = df.loc[i, sma_col]
        prev_close = df.loc[i - 1, "close"]
        prev_sma = df.loc[i - 1, sma_col]
        
        if condition == "crosses_above":
            return prev_close < prev_sma and close > sma
        if condition == "crosses_below":
            return prev_close > prev_sma and close < sma

    # -----------------------------
    # MACD CONDITIONS
    # -----------------------------
    if indicator == "MACD":
        if "macd" not in df.columns or "signal" not in df.columns:
            return False
            
        macd = df.loc[i, "macd"]
        signal = df.loc[i, "signal"]
        
        if condition == ">" or condition == "above":
            return macd > signal
        if condition == "<" or condition == "below":
            return macd < signal
        if condition == "crosses_above":
            prev_macd = df.loc[i - 1, "macd"]
            prev_signal = df.loc[i - 1, "signal"]
            return prev_macd < prev_signal and macd > signal
        if condition == "crosses_below":
            prev_macd = df.loc[i - 1, "macd"]
            prev_signal = df.loc[i - 1, "signal"]
            return prev_macd > prev_signal and macd < signal

    return False


def check_buy(df: pd.DataFrame, i: int, rule: Dict[str, Any]) -> bool:
    """Buy condition checker - uses universal checker"""
    return check_condition(df, i, rule)


def check_sell(df: pd.DataFrame, i: int, rule: Dict[str, Any]) -> bool:
    """Sell condition checker - uses universal checker"""
    return check_condition(df, i, rule)


# -----------------------------
# BACKTEST ENGINE
# -----------------------------
def run_backtest(asset: str, interval: str, range_value: str, rules: Dict[str, Any]) -> Dict[str, Any]:
    df = load_price_data(asset, interval, range_value)
    df = apply_indicators(df)

    in_trade = False
    entry_price = None
    entry_index = None
    trades: List[Dict[str, Any]] = []

    equity = 10000.0
    equity_curve: List[float] = [equity]

    buy_rule = rules.get("buy", {})
    sell_rule = rules.get("sell", {})

    for i in range(1, len(df)):
        close_price = float(df.loc[i, "close"])

        # BUY
        if not in_trade and check_buy(df, i, buy_rule):
            in_trade = True
            entry_price = close_price
            entry_index = i
            equity_curve.append(equity)
            continue

        # SELL
        if in_trade and check_sell(df, i, sell_rule):
            exit_price = close_price
            exit_index = i

            pl_pct = (exit_price - entry_price) / entry_price
            pl_usd = equity * pl_pct

            entry_time = df.loc[entry_index, "timestamp"]
            exit_time = df.loc[exit_index, "timestamp"]

            trade = {
                "entry_time": entry_time.strftime("%Y-%m-%d %H:%M:%S"),
                "entry_price": float(entry_price),
                "exit_time": exit_time.strftime("%Y-%m-%d %H:%M:%S"),
                "exit_price": float(exit_price),
                "pl_pct": round(pl_pct, 6),
                "pl_usd": round(pl_usd, 2),
            }
            trades.append(trade)

            equity = equity * (1 + pl_pct)
            in_trade = False
            entry_price = None
            entry_index = None

        equity_curve.append(equity)

    wins = len([t for t in trades if t["pl_pct"] > 0])
    losses = len([t for t in trades if t["pl_pct"] <= 0])

    profit_gains = sum([t["pl_pct"] for t in trades if t["pl_pct"] > 0])
    profit_losses = sum([t["pl_pct"] for t in trades if t["pl_pct"] <= 0])

    profit_factor = (
        (profit_gains / abs(profit_losses))
        if profit_losses != 0
        else (profit_gains if profit_gains != 0 else 1)
    )

    return {
        "win_ratio": (wins / len(trades)) if trades else 0,
        "loss_ratio": (losses / len(trades)) if trades else 0,
        "total_trades": len(trades),
        "profit_factor": round(profit_factor, 3),
        "equity_curve": equity_curve,
        "final_equity": round(equity, 2),
        "trades": trades,
    }