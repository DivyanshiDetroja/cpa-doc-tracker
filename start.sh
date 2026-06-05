#!/bin/bash
# Start backend and frontend dev servers

set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"

# Load env
if [ -f "$ROOT/.env" ]; then
  export $(grep -v '^#' "$ROOT/.env" | xargs)
fi

# Kill anything on 8000 left over from a previous run
lsof -ti:8000 | xargs kill -9 2>/dev/null || true

echo "Starting backend on http://localhost:8000 ..."
(cd "$ROOT/backend" && uvicorn main:app --reload --port 8000) &
BACKEND_PID=$!

echo "Starting frontend on http://localhost:3000 ..."
(cd "$ROOT/frontend" && npm run dev) &
FRONTEND_PID=$!

echo ""
echo "CPA DocCheck running:"
echo "  CPA Dashboard: http://localhost:3000"
echo "  Client Upload: http://localhost:3000/client"
echo ""
echo "Press Ctrl+C to stop both servers."

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT
wait
