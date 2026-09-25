#!/bin/bash
# ─────────────────────────────────────────────────────────────
#  One-click starter for the portfolio site.
#  Double-click this file in Finder (or run: ./start.command)
#  Keep the Terminal window open while you browse the site.
#  Closing that window stops the site.
# ─────────────────────────────────────────────────────────────

cd "$(dirname "$0")" || exit 1

PORT=3000
URL="http://localhost:$PORT"

# First run: install dependencies if they're missing
if [ ! -d node_modules ]; then
  echo "⚙️  First run — installing dependencies (this takes a minute)..."
  npm install || { echo "❌ npm install failed — see errors above."; exit 1; }
fi

# If the site is already running, just open it
if curl -s -o /dev/null --max-time 2 "$URL"; then
  echo "✅ Site is already running — opening $URL"
  open "$URL"
  exit 0
fi

echo "🚀 Starting dev server… (keep this window open)"
echo "   $URL"

# Open the browser as soon as the server responds (waits up to ~30s)
(
  for _ in $(seq 1 60); do
    if curl -s -o /dev/null --max-time 1 "$URL"; then
      open "$URL"
      exit 0
    fi
    sleep 0.5
  done
) &
WATCHER_PID=$!
trap 'kill "$WATCHER_PID" 2>/dev/null' EXIT

npm run dev -- -p "$PORT"

echo "🛑 Server stopped. Double-click start.command to start it again."
