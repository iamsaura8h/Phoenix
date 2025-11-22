# File: app/utils/json_cleaner.py

import re
import json

def extract_json(text: str):
    """
    Extract clean JSON from a Gemini response.
    Handles:
    - ```json ... ```
    - ``` ... ```
    - Surrounding text
    """

    # Remove ```json or ``` fences
    text = re.sub(r"```json", "", text)
    text = re.sub(r"```", "", text)

    # Trim whitespace
    text = text.strip()

    # Try direct JSON first
    try:
        return json.loads(text)
    except:
        pass

    # If direct parse fails, try to extract JSON-like structure
    json_pattern = re.compile(r"\{.*\}", re.DOTALL)
    match = json_pattern.search(text)
    if match:
        json_str = match.group(0)
        return json.loads(json_str)

    raise ValueError("Unable to extract JSON from Gemini response")
