#!/usr/bin/env bash
cd "$(dirname "$0")/frontend" || exit 1
echo "Starting Signal Clone Next.js Frontend on http://localhost:3000..."
npm run dev
