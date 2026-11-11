#!/usr/bin/env bash
# VidNest: Start all services (Backend API + Expo Web App + Public Preview Tunnels)
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
LOG_DIR="/tmp/opencode/vidnest"
mkdir -p "$LOG_DIR"

echo "======================================================================"
echo "✦ Starting VidNest Ecosystem (Violet Instrument v4)"
echo "  Architected by Atheerium (zaikabdou)"
echo "======================================================================"

# 1. Start Flask Web Platform & API (Port 5000)
if ! curl -s http://127.0.0.1:5000/healthz >/dev/null 2>&1; then
  echo "→ Launching Flask Backend on port 5000..."
  (cd "$ROOT_DIR" && PYTHONPATH=web:. python3 web/app.py >> "$LOG_DIR/web.log" 2>&1) &
  sleep 2
else
  echo "✔ Flask Backend is already running on port 5000."
fi

# 2. Start Expo Mobile/Web App (Port 8081)
if ! curl -s http://127.0.0.1:8081 >/dev/null 2>&1; then
  echo "→ Launching Expo App on port 8081..."
  (cd "$ROOT_DIR/mobile-expo" && EXPO_NO_TELEMETRY=1 npx expo start --web --port 8081 >> "$LOG_DIR/expo.log" 2>&1) &
  sleep 3
else
  echo "✔ Expo App is already running on port 8081."
fi

# 3. Ensure Public HTTPS Preview Tunnels via vps-preview
echo "→ Initializing Public HTTPS Tunnels..."
vps-preview --port 5000 >/dev/null 2>&1 || true
vps-preview --port 8081 >/dev/null 2>&1 || true

WEB_TUNNEL="$(grep -o 'https://[a-zA-Z0-9.-]*\.lhr\.life' /tmp/vps-tunnel-5000.log 2>/dev/null | tail -n 1 || echo '')"
EXPO_TUNNEL="$(grep -o 'https://[a-zA-Z0-9.-]*\.lhr\.life' /tmp/vps-tunnel-8081.log 2>/dev/null | tail -n 1 || echo '')"

echo ""
echo "======================================================================"
echo "🎉 VidNest is LIVE and ready for media downloads!"
echo "======================================================================"
echo ""
echo "🌐 Web Companion & API (Port 5000):"
echo "   Local:  http://127.0.0.1:5000"
if [[ -n "$WEB_TUNNEL" ]]; then
  echo "   Public: $WEB_TUNNEL"
fi
echo ""
echo "📱 Mobile Expo App (Port 8081):"
echo "   Local:  http://127.0.0.1:8081"
if [[ -n "$EXPO_TUNNEL" ]]; then
  echo "   Public: $EXPO_TUNNEL"
fi
echo ""
echo "📦 Official Android APK Download:"
echo "   GitHub Releases: https://github.com/Aetherdz/VidNest/releases/latest"
echo "   Direct Download: https://github.com/Aetherdz/VidNest/releases/latest/download/VidNest.apk"
echo ""
echo "📄 Logs:"
echo "   Web / API: $LOG_DIR/web.log"
echo "   Expo App:  $LOG_DIR/expo.log"
echo "======================================================================"
