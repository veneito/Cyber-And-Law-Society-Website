#!/usr/bin/env bash
# Pull the latest code from GitHub and rebuild if anything changed.
# Run every 5 min by cls-site-update.timer. Log: ~/cls-site/update.log
set -euo pipefail
cd "$(dirname "$0")/.."
git fetch -q origin main
if [ "$(git rev-parse HEAD)" = "$(git rev-parse origin/main)" ] && [ -f dist/index.html ]; then exit 0; fi
echo "$(date -Is) updating to $(git rev-parse --short origin/main)"
git merge -q --ff-only origin/main
npm ci --no-audit --no-fund
npx vite build
sudo -n systemctl restart cls-site 2>/dev/null || true
echo "$(date -Is) done"
