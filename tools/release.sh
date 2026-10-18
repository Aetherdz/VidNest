#!/usr/bin/env bash
# tools/release.sh - cut a Movid release: build, archive to dist/, hash, optionally send.
#
# Usage: tools/release.sh [--send]
#
#   (no args)  run the release build through tools/smart_build.sh, then copy the
#              release APK to dist/movid-<versionName>-release.apk and print its
#              sha256 + human-readable size.
#   --send     additionally forward that artifact to Telegram, but only when the
#              APK is signed (source filename without "unsigned") and
#              <= 50,000,000 bytes - the same rule as `smart_build.sh send`.
#
# The build runs in the single Gradle lane enforced by smart_build.sh
# (flock on /tmp/opencode/movid-gradle.lock, GRADLE_USER_HOME=/tmp/opencode/gradle-home).

set -uo pipefail

TOOLS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$TOOLS_DIR/.." && pwd)"

SMART_BUILD="$TOOLS_DIR/smart_build.sh"
BUILD_GRADLE="$PROJECT_DIR/app/build.gradle.kts"
DIST_DIR="$PROJECT_DIR/dist"
REL_APK_DIR=/tmp/opencode/movid-build/app/outputs/apk/release
TG_REPORT=/home/zaikabdou1/FetchCUT/tools/tg_report.sh
MAX_TG_BYTES=50000000

usage() {
  cat <<'EOF'
Usage: tools/release.sh [--send]

  (no args)  build the release APK via tools/smart_build.sh, copy it to
             dist/movid-<versionName>-release.apk and print sha256 + size.
  --send     also deliver it to Telegram when it is signed and <= 50,000,000 bytes.
EOF
}

human_size() {
  local bytes="$1"
  if command -v numfmt >/dev/null 2>&1; then
    numfmt --to=iec --suffix=B "$bytes"
  else
    printf '%s bytes' "$bytes"
  fi
}

SEND=0
for arg in "$@"; do
  case "$arg" in
    --send) SEND=1 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "release.sh: unknown argument: $arg" >&2; usage >&2; exit 2 ;;
  esac
done

if [ ! -x "$SMART_BUILD" ]; then
  echo "release.sh: $SMART_BUILD is missing or not executable." >&2
  exit 1
fi

echo "==> release.sh: building release APK via smart_build.sh"
"$SMART_BUILD" release
rc=$?
if [ "$rc" -ne 0 ]; then
  echo "release.sh: release build failed (smart_build.sh exit $rc); nothing copied." >&2
  exit "$rc"
fi

# ---- locate the freshest release APK -----------------------------------
SRC="$REL_APK_DIR/app-release.apk"
if [ ! -f "$SRC" ]; then
  SRC="$REL_APK_DIR/app-release-unsigned.apk"
fi
if [ ! -f "$SRC" ]; then
  echo "release.sh: no release APK found under $REL_APK_DIR" >&2
  exit 1
fi

BASE="$(basename "$SRC")"
SIGNED=1
if [[ "$BASE" == *unsigned* ]]; then
  SIGNED=0   # authoritative sign check: the filename AGP actually produced
fi

# ---- versionName -> artifact name --------------------------------------
VERSION="$(grep -m1 -E '^[[:space:]]*versionName[[:space:]]*=' "$BUILD_GRADLE" 2>/dev/null \
  | sed -E 's/^[^"]*"([^"]+)".*/\1/')"
case "$VERSION" in
  ""|*'"'*|*[[:space:]]*) VERSION="0.0.0" ;;   # fallback when parsing fails
esac

# ---- archive to dist/ ---------------------------------------------------
mkdir -p "$DIST_DIR"
DST="$DIST_DIR/movid-${VERSION}-release.apk"
cp -f "$SRC" "$DST"

SHA="$(sha256sum "$DST" | awk '{print $1}')"
BYTES="$(stat -c %s "$DST")"

echo
echo "==> Artifact : $DST"
echo "==> SHA-256  : $SHA"
echo "==> Size     : $(human_size "$BYTES") ($BYTES bytes)"
if [ "$SIGNED" -eq 0 ]; then
  echo "==> NOTE     : built from $BASE - UNSIGNED (Movid v1 has no release signingConfig)."
fi

# ---- optional Telegram delivery (same signed + size rule) --------------
if [ "$SEND" -eq 1 ]; then
  if [ "$SIGNED" -eq 0 ]; then
    echo "==> NOT SENT: source '$BASE' is unsigned; only signed APKs are delivered."
  elif [ "$BYTES" -gt "$MAX_TG_BYTES" ]; then
    echo "==> NOT SENT: $(human_size "$BYTES") ($BYTES bytes) exceeds the 50,000,000-byte limit."
  elif [ ! -x "$TG_REPORT" ]; then
    echo "==> NOT SENT: Telegram sender missing or not executable: $TG_REPORT" >&2
    exit 1
  else
    echo "==> Sending $(basename "$DST") via tg_report.sh ..."
    if "$TG_REPORT" file "$DST"; then
      echo "==> SENT: $(basename "$DST")"
    else
      rc=$?
      echo "==> SEND FAILED (tg_report.sh exit $rc). Artifact kept at: $DST" >&2
      exit "$rc"
    fi
  fi
fi

exit 0
