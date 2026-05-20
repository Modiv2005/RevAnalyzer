#!/bin/bash

# Visual Header
echo "=========================================================="
echo "      ANTIGRAVITY DECISION INTELLIGENCE PLATFORM           "
echo "=========================================================="
echo "Initializing local enterprise SaaS workspaces..."

# Ensure we're in the correct directory
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

# Launch Python backend on Port 8000
echo "[1/2] Spinning up FastAPI gateway server..."
python3 -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 > backend.log 2>&1 &
BACKEND_PID=$!

# Wait for backend health check
echo "Waiting for backend database schema migration..."
sleep 3

# Launch Vite react dev server on Port 3000
echo "[2/2] Launching Vite React-TypeScript client..."
cd frontend
npm run dev &
FRONTEND_PID=$!

# Register shutdown traps
trap "kill $BACKEND_PID $FRONTEND_PID; echo 'Platform servers successfully offline.'; exit" INT TERM

echo ""
echo "----------------------------------------------------------"
echo "  🚀 PLATFORM ONLINE & SEAMLESSLY CONNECTED"
echo "  ➜ Client Dashboard: http://localhost:3000"
echo "  ➜ Backend API Swagger docs: http://localhost:8000/api/v1/docs"
echo "  ➜ Logs active under backend.log"
echo "----------------------------------------------------------"
echo "Press [CTRL+C] to stop all local services."
echo ""

# Keep running
wait
