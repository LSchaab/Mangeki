#!/bin/bash
# Run this every time you want to spin up Mangeki locally.
# Double-click won't work for shell scripts on macOS — run it from Terminal:
#   ./scripts/start.sh
#
# What it does, step by step:
#   1. Makes sure dependencies are installed (npm install), only if needed.
#   2. Starts the dev server on a FIXED port (3001) instead of the Next.js
#      default (3000) — that way it never collides with your other 2 local
#      projects. Suggested convention: this project = 3001, project #2 = 3002,
#      project #3 = 3003.
#   3. Waits until the server responds, then opens it in Google Chrome.
#   4. Keeps running in this Terminal window so you can see the logs.
#      To stop the server: click into this window and press Ctrl+C.

set -e

PORT=3001

# Move into the project folder no matter where this script was run from.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

# Install dependencies only if they're missing (skips this on every re-run).
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies (first run)..."
  npm install
fi

# If something is already answering on that port, assume it's our own
# server from a previous run — just open the browser instead of starting
# a second copy (which would fail anyway, since the port is taken).
if lsof -nP -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  echo "Mangeki is already running on port $PORT — opening it in Chrome."
  open -a "Google Chrome" "http://localhost:$PORT"
  exit 0
fi

# Start the dev server in the background of this script so we can wait
# for it to be ready before opening the browser.
npm run dev -- -p "$PORT" &
DEV_PID=$!

echo "Starting Mangeki on port $PORT..."
for i in $(seq 1 30); do
  if curl -s -o /dev/null "http://localhost:$PORT" 2>/dev/null; then
    break
  fi
  sleep 1
done

open -a "Google Chrome" "http://localhost:$PORT"
echo "Mangeki is up: http://localhost:$PORT"
echo "Leave this window open. Press Ctrl+C here to stop the server."

# Hand control back to the dev server process so its logs show up here,
# and so Ctrl+C in this window actually stops it.
wait "$DEV_PID"
