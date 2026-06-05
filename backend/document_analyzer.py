import anthropic
from json_utils import parse_json

client = anthropic.Anthropic()


def analyze_document(extracted_text: str, entity_name: str, audit_year: int, required_docs: list) -> dict:
    required_types = [d["type"] for d in required_docs]
    required_list_str = ", ".join(f'"{t}"' for t in required_types)

    prompt = f"""You are a financial statement auditor reviewing documents submitted by a client.

Client entity on file: {entity_name}
Required audit period (fiscal year): {audit_year}
Required document types: [{required_list_str}]

Analyze the following document text and return a JSON object with exactly these fields:
- identified_type: the document type (must be one of the required types above, or "Unknown" if it does not match any)
- detected_year: the fiscal year found in the document as an integer, or null if not found
- detected_client: the entity name found in the document as a string, or null if not found
- type_correct: boolean — does identified_type match any document in the required types list?
- year_correct: boolean — does detected_year equal {audit_year}?
- client_correct: boolean — does detected_client closely match "{entity_name}"?
- rejection_reason: a short string describing why the document fails if any check is false, or null if all pass

Return only valid JSON. No preamble, no markdown.

Document text:
{extracted_text}"""

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=512,
        messages=[{"role": "user", "content": prompt}],
    )

    raw = response.content[0].text.strip()
    result = parse_json(raw)

    all_pass = result["type_correct"] and result["year_correct"] and result["client_correct"]
    result["status"] = "accepted" if all_pass else ("rejected" if result["identified_type"] != "Unknown" else "unrecognized")

    return result
