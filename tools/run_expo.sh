#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
NODE_24_BIN="/home/abdozaik720/.nvm/versions/node/v24.21.0/bin"

if [[ -d "$NODE_24_BIN" ]]; then
  export PATH="$NODE_24_BIN:$PATH"
fi

cd "$PROJECT_DIR/mobile-expo"

echo "Running Expo app tests..."
npm test

cat <<'USAGE'

Tests passed. To launch the app from mobile-expo/, run one of:
  npx expo start --web
  npx expo start --android
USAGE
