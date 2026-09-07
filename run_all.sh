#!/usr/bin/env bash
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

cleanup() {
    echo ""
    echo "Stopping Signal Clone services..."
    kill $(jobs -p) 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM EXIT

echo "=========================================================="
echo "    Secure Messaging Platform (Signal Clone)"
echo "=========================================================="

echo "Starting FastAPI Backend on http://localhost:8000..."
cd "$PROJECT_DIR/backend"
"$PROJECT_DIR/backend/venv/bin/uvicorn" app.main:app --host 0.0.0.0 --port 8000 &

sleep 2

echo "Starting Next.js Frontend on http://localhost:3000..."
cd "$PROJECT_DIR/frontend"
npm run dev &

echo ""
echo "🚀 Application is running!"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend API Docs: http://localhost:8000/docs"
echo "   - Press Ctrl+C to stop both servers."
echo ""

wait
