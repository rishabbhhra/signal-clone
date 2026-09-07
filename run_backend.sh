#!/usr/bin/env bash
cd "$(dirname "$0")/backend" || exit 1
source venv/bin/activate
echo "Starting Signal Clone FastAPI Backend on http://localhost:8000..."
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
