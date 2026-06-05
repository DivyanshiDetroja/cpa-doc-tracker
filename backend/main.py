import os
import json
from datetime import date, timedelta
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response

from client_profile import CLIENT_PROFILE
from pdf_extractor import extract_text
from document_analyzer import analyze_document
from missing_docs_engine import build_missing_docs_report
from email_generator import generate_email

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory session state
state = {
    "uploaded_docs": [],   # list of doc dicts (without raw bytes)
    "pdf_bytes": {},       # filename -> raw bytes
    "missing_docs_report": None,
}


@app.get("/client-profile")
def get_client_profile():
    return CLIENT_PROFILE


@app.get("/documents")
def get_documents():
    return [
        {k: v for k, v in d.items() if k != "extracted_text"}
        for d in state["uploaded_docs"]
    ]


@app.get("/document/{filename}")
def get_document(filename: str):
    raw = state["pdf_bytes"].get(filename)
    if raw is None:
        raise HTTPException(status_code=404, detail="Document not found")
    return Response(content=raw, media_type="application/pdf")


@app.post("/upload-documents")
async def upload_documents(files: list[UploadFile] = File(...)):
    for upload in files:
        if not upload.filename.lower().endswith(".pdf"):
            continue

        raw = await upload.read()
        state["pdf_bytes"][upload.filename] = raw

        try:
            text = extract_text(raw)
        except Exception:
            text = ""

        if not text:
            doc = {
                "filename": upload.filename,
                "extracted_text": "",
                "identified_type": "Unknown",
                "detected_year": None,
                "detected_client": None,
                "type_correct": False,
                "year_correct": False,
                "client_correct": False,
                "status": "unrecognized",
                "rejection_reason": "Could not extract text from PDF",
            }
        else:
            try:
                result = analyze_document(
                    text,
                    CLIENT_PROFILE["name"],
                    CLIENT_PROFILE["tax_year"],
                    CLIENT_PROFILE["required_docs"],
                )
                doc = {"filename": upload.filename, "extracted_text": text, **result}
            except Exception as e:
                doc = {
                    "filename": upload.filename,
                    "extracted_text": text,
                    "identified_type": "Unknown",
                    "detected_year": None,
                    "detected_client": None,
                    "type_correct": False,
                    "year_correct": False,
                    "client_correct": False,
                    "status": "unrecognized",
                    "rejection_reason": f"Analysis error: {str(e)}",
                }

        state["uploaded_docs"] = [d for d in state["uploaded_docs"] if d["filename"] != upload.filename]
        state["uploaded_docs"].append(doc)

    try:
        state["missing_docs_report"] = build_missing_docs_report(CLIENT_PROFILE, state["uploaded_docs"])
    except Exception:
        state["missing_docs_report"] = None

    return [
        {k: v for k, v in d.items() if k != "extracted_text"}
        for d in state["uploaded_docs"]
    ]


@app.get("/missing-docs-report")
def get_missing_docs_report():
    if state["missing_docs_report"] is None:
        state["missing_docs_report"] = build_missing_docs_report(CLIENT_PROFILE, state["uploaded_docs"])
    return state["missing_docs_report"]


@app.post("/generate-email")
def generate_email_endpoint():
    if state["missing_docs_report"] is None:
        state["missing_docs_report"] = build_missing_docs_report(CLIENT_PROFILE, state["uploaded_docs"])
    email_body = generate_email(CLIENT_PROFILE, state["missing_docs_report"])
    return {"email_body": email_body}


@app.get("/reminder")
def get_reminder():
    follow_up_date = (date.today() + timedelta(days=2)).strftime("%B %d, %Y")
    report = state["missing_docs_report"] or build_missing_docs_report(CLIENT_PROFILE, state["uploaded_docs"])
    outstanding = [d["doc_type"] for d in report.get("missing", [])] + [d["doc_type"] for d in report.get("rejected", [])]
    return {
        "follow_up_date": follow_up_date,
        "outstanding_items": outstanding,
    }


@app.delete("/reset")
def reset_state():
    state["uploaded_docs"] = []
    state["pdf_bytes"] = {}
    state["missing_docs_report"] = None
    return {"ok": True}
