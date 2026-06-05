import anthropic

client = anthropic.Anthropic()


def generate_email(profile: dict, missing_docs_report: dict) -> str:
    trail = "\n".join(f'{e["date"]}: {e["note"]}' for e in profile["communication_trail"])

    missing_lines = "\n".join(
        f'- {d["doc_type"]} ({d["source"]}): {d["context_note"]}'
        for d in missing_docs_report.get("missing", [])
    )
    rejected_lines = "\n".join(
        f'- {d["doc_type"]} ({d["filename"]}): {d["reason"]}'
        for d in missing_docs_report.get("rejected", [])
    )

    outstanding = ""
    if missing_lines:
        outstanding += f"Still missing:\n{missing_lines}\n"
    if rejected_lines:
        outstanding += f"\nDocuments that need to be re-uploaded:\n{rejected_lines}"

    prompt = f"""You are drafting a professional follow-up email on behalf of {profile["assigned_cpa"]}, CPA, to their client {profile["name"]}.

CLIENT CONTEXT:
- Filing type: {profile["entity_type"]}
- Filing deadline: {profile["filing_deadline"]}
- Communication trail:
{trail}

STILL MISSING OR INVALID:
{outstanding}

Write a professional, warm, specific email that:
1. Acknowledges what has already been received
2. Lists exactly what is still needed with brief context for each item
3. References the filing deadline with appropriate urgency
4. Does not mention specific dollar amounts or tax positions
5. Is addressed directly to {profile["name"]}

Tone: professional but approachable. Not robotic. Not threatening.
Length: under 200 words.
Do not add a subject line — just the email body."""

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=512,
        messages=[{"role": "user", "content": prompt}],
    )

    return response.content[0].text.strip()
