# CPA DocCheck

AI-powered financial statement intake and missing document assistant for audit engagements. Built for the NYCPA Hackathon.



https://github.com/user-attachments/assets/e4512151-2261-417d-9ade-ff92a4d970ef

---

## What it does

A CPA uploads their client's audit documents. Claude reads each PDF, verifies the document type, fiscal year, and entity name against the client's engagement profile, and flags anything wrong or missing. The CPA gets a context-aware missing docs report and a one-click email draft — personalized to what's been communicated with the client.

**Demo client:** Meridian Retail Group LLC — FY2025 audit

---

## Stack

- **Backend:** Python + FastAPI
- **Frontend:** React + Tailwind CSS + Vite
- **AI:** Anthropic Claude API (`claude-sonnet-4-6`)
- **PDF parsing:** pypdf
- **Dummy PDF generation:** reportlab

---

## Setup

### 1. Clone and install

```bash
git clone https://github.com/DivyanshiDetroja/cpa-doc-tracker.git
cd cpa-doc-tracker
```

Install Python dependencies:
```bash
pip install fastapi uvicorn pypdf reportlab anthropic python-multipart python-dotenv
```

Install frontend dependencies:
```bash
cd frontend && npm install && cd ..
```

### 2. Add your API key

```bash
cp .env.example .env
# Edit .env and add your Anthropic API key
```

### 3. Generate dummy PDFs

```bash
cd backend && python generate_dummy_pdfs.py && cd ..
```

### 4. Run

```bash
./start.sh
```

- **CPA Dashboard:** http://localhost:3000
- **Client Upload:** http://localhost:3000/client

---

## Demo flow

1. Open the CPA dashboard at `localhost:3000`
2. Open the client upload page at `localhost:3000/client` in another tab
3. Drag and drop the 5 PDFs from `dummy_docs/` on the client page
4. Watch the CPA dashboard auto-populate with Claude's analysis per file
5. Switch to **Pending & Reminders** — missing docs report is ready
6. Click **Generate Email** — Claude drafts a personalized follow-up

### Dummy documents

| File | Expected result |
|------|----------------|
| `balance_sheet.pdf` | ✅ Accepted |
| `income_statement.pdf` | ✅ Accepted |
| `ar_aging_report.pdf` | ✅ Accepted |
| `cash_flow_fy2024.pdf` | ❌ Rejected — wrong fiscal year (2024) |
| `office_lease_agreement.pdf` | ❌ Unrecognized — not on required list |

---

## Project structure

```
cpa-doc-tracker/
├── backend/
│   ├── main.py                  # FastAPI app, all endpoints
│   ├── client_profile.py        # Hardcoded Meridian Retail Group profile
│   ├── document_analyzer.py     # Claude 3-check validation per document
│   ├── missing_docs_engine.py   # Context-aware missing docs report
│   ├── email_generator.py       # Claude email draft
│   ├── pdf_extractor.py         # pypdf text extraction
│   ├── json_utils.py            # Strips markdown fences from Claude JSON responses
│   └── generate_dummy_pdfs.py   # One-time script to generate demo PDFs
├── frontend/
│   └── src/
│       ├── App.jsx              # Root — routes / to CPA dashboard, /client to upload page
│       ├── api.js               # All fetch calls to FastAPI
│       └── components/
│           ├── DocumentsTab.jsx     # Auto-polling document list with View PDF buttons
│           ├── CaseContextTab.jsx   # Engagement profile and communication trail
│           ├── PendingTab.jsx       # Missing docs, reminder badge, email generator
│           └── ClientUploadPage.jsx # Client-facing drag-and-drop upload
├── dummy_docs/                  # Pre-generated demo PDFs (git-ignored)
├── .env.example                 # Copy to .env and add ANTHROPIC_API_KEY
└── start.sh                     # Starts both servers
```

---

## API endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/client-profile` | Engagement profile, required docs, communication trail |
| GET | `/documents` | Current list of uploaded and analyzed documents |
| GET | `/document/{filename}` | Serve raw PDF for in-browser viewing |
| POST | `/upload-documents` | Upload PDFs, run Claude analysis, rebuild missing docs report |
| GET | `/missing-docs-report` | Current missing and rejected docs with urgency levels |
| POST | `/generate-email` | Claude-drafted follow-up email |
| GET | `/reminder` | Simulated follow-up date (today + 2 days) and outstanding items |
| DELETE | `/reset` | Clear all session state |
