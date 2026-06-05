import anthropic
from json_utils import parse_json

client = anthropic.Anthropic()


def build_missing_docs_report(profile: dict, uploaded_docs: list) -> dict:
    accepted = [d for d in uploaded_docs if d["status"] == "accepted"]
    rejected = [d for d in uploaded_docs if d["status"] in ("rejected", "unrecognized")]

    accepted_types = {d["identified_type"] for d in accepted}
    required = profile["required_docs"]
    missing_types = [r for r in required if r["type"] not in accepted_types]

    if not missing_types and not rejected:
        return {
            "missing": [],
            "rejected": [{"filename": d["filename"], "doc_type": d["identified_type"], "reason": d["rejection_reason"]} for d in rejected],
            "accepted": list(accepted_types),
        }

    accepted_list = ", ".join(accepted_types) if accepted_types else "None"
    rejected_list = "\n".join(
        f'- {d["filename"]}: {d["identified_type"]} ({d["rejection_reason"]})'
        for d in rejected
    ) or "None"
    missing_list = "\n".join(f'- {r["type"]} from {r["source"]}' for r in missing_types) or "None"
    trail = "\n".join(f'{e["date"]}: {e["note"]}' for e in profile["communication_trail"])

    prompt = f"""You are an AI assistant for a CPA firm analyzing a client's document intake status.

CLIENT: {profile["name"]} | {profile["entity_type"]} | Tax Year: {profile["tax_year"]}

COMMUNICATION TRAIL:
{trail}

DOCUMENTS ACCEPTED:
{accepted_list}

DOCUMENTS STILL MISSING:
{missing_list}

DOCUMENTS REJECTED (uploaded but failed validation):
{rejected_list}

For each missing document, assign urgency:
- "high": no prior communication about this document
- "medium": client was reminded but gave no update
- "low": client communicated a reason for delay or expected date

Return a JSON object with this exact shape:
{{
  "missing": [
    {{"doc_type": "...", "source": "...", "urgency": "high|medium|low", "context_note": "..."}}
  ],
  "rejected": [
    {{"filename": "...", "doc_type": "...", "reason": "..."}}
  ],
  "accepted": ["..."]
}}

Return only valid JSON. No preamble."""

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt}],
    )

    raw = response.content[0].text.strip()
    result = parse_json(raw)
    return result
