import re
import json


def parse_json(text: str) -> dict:
    text = text.strip()
    # Strip markdown code fences if Claude wraps the response
    match = re.search(r'```(?:json)?\s*([\s\S]*?)```', text)
    if match:
        text = match.group(1).strip()
    return json.loads(text)
