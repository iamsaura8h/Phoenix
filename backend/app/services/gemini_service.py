# File: app/services/gemini_service.py

import requests
import os
import json

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash-lite")

GEMINI_URL = (
    f"https://generativelanguage.googleapis.com/v1/models/"
    f"{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}"
)

HEADERS = {"Content-Type": "application/json"}


def validate_strategy_with_gemini(strategy: str):
    """
    Gemini validator with STRICT output format that matches the backtest engine.
    """

    prompt = f"""
You are a crypto trading strategy validator and rule generator.

The user wrote a strategy:
\"{strategy}\"

Your tasks:
1. Determine if the strategy is complete (has BOTH buy AND sell conditions).
2. If incomplete → valid=false with suggestions.
3. If complete → valid=true with structured rules.

ACCEPTANCE RULES:
✅ ACCEPT these strategies (they are valid):
- "Buy when RSI < 30, sell when RSI > 70"
- "Buy when price crosses above 20 EMA, sell when crosses below"
- "Buy when 20 EMA crosses above 50 EMA, sell when crosses below"
- "Buy when MACD > signal, sell when MACD < signal"
- "Buy when price crosses above 50 SMA, sell when crosses below"

❌ REJECT only if:
- Missing buy OR sell condition entirely
- Completely nonsensical (e.g., "buy when moon")

DO NOT require:
- Stop loss or take profit
- Multiple confirmations
- Specific indicator parameters
- Risk management rules

CRITICAL: You MUST output rules in this EXACT format. NO other format is acceptable.

SUPPORTED INDICATORS:
- RSI (values 0-100)
- EMA20, EMA50, EMA100, EMA200
- SMA (any period via Price + moving_average object)
- MACD

OUTPUT FORMAT (STRICT):

{{
  "valid": true,
  "error": null,
  "suggestions": [],
  "rules": {{
    "buy": {{
      "indicator": "INDICATOR_NAME",
      "condition": "CONDITION_TYPE",
      "value": NUMBER_OR_NULL
    }},
    "sell": {{
      "indicator": "INDICATOR_NAME",
      "condition": "CONDITION_TYPE",
      "value": NUMBER_OR_NULL
    }}
  }}
}}

EXACT EXAMPLES YOU MUST FOLLOW:

1. RSI Strategy:
Strategy: "Buy when RSI < 30, sell when RSI > 70"
Output:
{{
  "valid": true,
  "error": null,
  "suggestions": [],
  "rules": {{
    "buy": {{
      "indicator": "RSI",
      "condition": "<",
      "value": 30
    }},
    "sell": {{
      "indicator": "RSI",
      "condition": ">",
      "value": 70
    }}
  }}
}}

2. EMA Crossover (Price vs EMA):
Strategy: "Buy when price crosses above 20 EMA, sell when crosses below"
Output:
{{
  "valid": true,
  "error": null,
  "suggestions": [],
  "rules": {{
    "buy": {{
      "indicator": "EMA20",
      "condition": "crosses_above",
      "value": null
    }},
    "sell": {{
      "indicator": "EMA20",
      "condition": "crosses_below",
      "value": null
    }}
  }}
}}

3. EMA Crossover (EMA vs EMA):
Strategy: "Buy when 20 EMA crosses above 50 EMA, sell when crosses below"
Output:
{{
  "valid": true,
  "error": null,
  "suggestions": [],
  "rules": {{
    "buy": {{
      "indicator": "EMA20",
      "condition": "crosses_above",
      "compare_to": "EMA50"
    }},
    "sell": {{
      "indicator": "EMA20",
      "condition": "crosses_below",
      "compare_to": "EMA50"
    }}
  }}
}}

4. SMA Crossover:
Strategy: "Buy when price crosses above 50 SMA, sell when crosses below"
Output:
{{
  "valid": true,
  "error": null,
  "suggestions": [],
  "rules": {{
    "buy": {{
      "indicator": "Price",
      "condition": "crosses_above",
      "moving_average": {{
        "period": 50
      }}
    }},
    "sell": {{
      "indicator": "Price",
      "condition": "crosses_below",
      "moving_average": {{
        "period": 50
      }}
    }}
  }}
}}

5. MACD Strategy:
Strategy: "Buy when MACD crosses above signal, sell when crosses below"
Output:
{{
  "valid": true,
  "error": null,
  "suggestions": [],
  "rules": {{
    "buy": {{
      "indicator": "MACD",
      "condition": "crosses_above",
      "value": null
    }},
    "sell": {{
      "indicator": "MACD",
      "condition": "crosses_below",
      "value": null
    }}
  }}
}}

CONDITION TYPES (use these exact strings):
- "crosses_above" - for crossovers going up
- "crosses_below" - for crossovers going down
- "<" - for less than comparisons
- ">" - for greater than comparisons
- "above" - for above comparisons (same as >)
- "below" - for below comparisons (same as <)

CRITICAL RULES:
1. Indicator names must be UPPERCASE: RSI, EMA20, EMA50, MACD, Price
2. Use "condition" field (NOT "operator")
3. For SMA: indicator must be "Price" with nested "moving_average" object
4. For EMA vs EMA: use "compare_to" field
5. Always set value to null if not comparing to a number
6. Never add extra fields beyond the examples shown

Respond ONLY with valid JSON. No code fences. No explanatory text. Just the JSON object.
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

    if response.status_code != 200:
        print("❌ Gemini API error:", response.text)
        return None

    try:
        raw = response.json()["candidates"][0]["content"]["parts"][0]["text"]
        print("\n" + "="*60)
        print("📤 RAW GEMINI OUTPUT:")
        print("="*60)
        print(raw)
        print("="*60 + "\n")

        # Clean response
        clean = raw.strip()
        clean = clean.replace("```json", "").replace("```", "").strip()

        data = json.loads(clean)

        # Safety enforcement
        if "rules" not in data or not isinstance(data["rules"], dict):
            data["rules"] = {"buy": {}, "sell": {}}

        data["rules"].setdefault("buy", {})
        data["rules"].setdefault("sell", {})

        print("✅ Parsed rules:")
        print(json.dumps(data["rules"], indent=2))
        print()

        return data

    except Exception as e:
        print("❌ Gemini parse error:", e)
        print("Raw response:", raw if 'raw' in locals() else "No response")
        return None