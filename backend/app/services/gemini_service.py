# File: app/services/gemini_service.py

import requests
import os

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash-lite")

GEMINI_URL = f"https://generativelanguage.googleapis.com/v1/models/{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}"

HEADERS = {"Content-Type": "application/json"}


def interpret_strategy_with_gemini(strategy: str):
    """Send user strategy text to Gemini and extract structured buy/sell rules."""

    prompt = f"""
    You are an AI that converts plain English crypto trading strategies into structured JSON rules.

    Example input:
    "Buy when RSI < 30 and sell when price crosses above EMA20."

    Example output:
    {{
      "buy": {{
        "indicator": "RSI",
        "operator": "<",
        "value": 30
      }},
      "sell": {{
        "indicator": "EMA20",
        "condition": "crosses_above"
      }}
    }}

    Now convert this strategy into JSON rules only, with no extra text.

    Strategy: "{strategy}"
    """

    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt}
                ]
            }
        ]
    }

    response = requests.post(GEMINI_URL, headers=HEADERS, json=payload)
    response.raise_for_status()

    data = response.json()

    try:
        ai_output = data["candidates"][0]["content"]["parts"][0]["text"]
        print("RAW GEMINI OUTPUT: \n", ai_output)
        return ai_output
    except Exception as e:
        print("Gemini Parsing Error:", e)
        return None
