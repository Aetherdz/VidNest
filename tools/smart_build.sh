#!/usr/bin/env bash
# tools/smart_build.sh - single-lane Gradle driver for the Movid Android project.
#
# Usage: tools/smart_build.sh <compile|debug|release|test|send> [--clean]
#
#   compile   :app:compileDebugKotlin    fastest Kotlin / Compose sanity check
#   debug     :app:assembleDebug         build the debug APK
#   release   :app:assembleRelease       build the release APK
#   test      :app:testDebugUnitTest     run JVM unit tests
#   send      build release, then deliver the APK to Telegram when it is
#             signed (filename without "unsigned") and <= 50,000,000 bytes
#
#   --clean   prepend the Gradle `clean` task to the invocation
#
# House rules (see tools/README.md):
#   * ONE Gradle build at a time. A non-blocking flock on
#     /tmp/opencode/movid-gradle.lock prints a message and exits 3 on
#     contention instead of starting a second build.
#   * GRADLE_USER_HOME is always /tmp/opencode/gradle-home.
#   * Module build dirs live in /tmp/opencode/movid-build/<project>
#     (redirected by the root build.gradle.kts).
#   * Full output is teed to /tmp/opencode/logs/movid-<task>-<UTC-ts>.log.
#
# Telegram delivery talks to /home/zaikabdou1/FetchCUT/tools/tg_report.sh
# (it reads its own env/config; this script never prints its internals).

set -uo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

export GRADLE_USER_HOME=/tmp/opencode/gradle-home

LOCK_FILE=/tmp/opencode/movid-gradle.lock
LOG_DIR=/tmp/opencode/logs
BUILD_DIR=/tmp/opencode/movid-build
TG_REPORT=/home/zaikabdou1/FetchCUT/tools/tg_report.sh
MAX_TG_BYTES=50000000

usage() {
  cat <<'EOF'
Usage: tools/smart_build.sh <compile|debug|release|test|send> [--clean]

  compile   :app:compileDebugKotlin    fastest Kotlin / Compose sanity check
  debug     :app:assembleDebug         build the debug APK
  release   :app:assembleRelease       build the release APK
  test      :app:testDebugUnitTest     run JVM unit tests
  send      build release, then deliver the APK to Telegram when it is
            signed and <= 50,000,000 bytes

  --clean   prepend the Gradle `clean` task

Logs: /tmp/opencode/logs/movid-<task>-<UTC timestamp>.log
One Gradle build at a time (lock: /tmp/opencode/movid-gradle.lock; exit 3 on contention).
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

TASK="${1:-}"
case "$TASK" in
  ""|-h|--help)
    usage
    [ -n "$TASK" ] || exit 2
    exit 0
    ;;
esac
shift

CLEAN=0
for arg in "$@"; do
  case "$arg" in
    --clean) CLEAN=1 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "smart_build.sh: unknown argument: $arg" >&2; usage >&2; exit 2 ;;
  esac
done

case "$TASK" in
  compile)      GRADLE_TASKS=(:app:compileDebugKotlin) ;;
  debug)        GRADLE_TASKS=(:app:assembleDebug) ;;
  release|send) GRADLE_TASKS=(:app:assembleRelease) ;;
  test)         GRADLE_TASKS=(:app:testDebugUnitTest) ;;
  *) echo "smart_build.sh: unknown task: $TASK" >&2; usage >&2; exit 2 ;;
esac
if [ "$CLEAN" -eq 1 ]; then
  GRADLE_TASKS=(clean "${GRADLE_TASKS[@]}")
fi

mkdir -p "$LOG_DIR"

# ---- one-Gradle-at-a-time guard ----------------------------------------
exec 9>"$LOCK_FILE"
if ! flock -n 9; then
  cat >&2 <<EOF
smart_build.sh: another Gradle build is already running for Movid.
  lock: $LOCK_FILE
  Wait for it to finish, then re-run. One Gradle build at a time (low RAM).
EOF
  exit 3
fi

TS="$(date -u +%Y%m%dT%H%M%SZ)"
LOG_FILE="$LOG_DIR/movid-$TASK-$TS.log"

cd "$PROJECT_DIR" || { echo "smart_build.sh: cannot cd to $PROJECT_DIR" >&2; exit 1; }

echo "==> Movid $TASK -> ./gradlew --console=plain ${GRADLE_TASKS[*]}"
echo "==> Log: $LOG_FILE"

./gradlew --console=plain "${GRADLE_TASKS[@]}" 2>&1 | tee "$LOG_FILE"
status=${PIPESTATUS[0]}

if [ "$status" -ne 0 ]; then
  {
    echo
    echo "==> BUILD FAILED (gradle exit $status). Last 40 log lines:"
    tail -n 40 "$LOG_FILE"
    echo "==> Full log: $LOG_FILE"
  } >&2
  exit "$status"
fi

echo
grep -F 'BUILD SUCCESSFUL' "$LOG_FILE" | tail -n 1

case "$TASK" in
  compile|test)
    echo "==> Done: no APK produced by the '$TASK' task. Log: $LOG_FILE"
    exit 0
    ;;
esac

# Prefer the signed release APK; fall back to the unsigned one AGP emits when
# no signingConfig is configured (the case for Movid v1).
if [ "$TASK" = "debug" ]; then
  APK="$BUILD_DIR/app/outputs/apk/debug/app-debug.apk"
else
  APK="$BUILD_DIR/app/outputs/apk/release/app-release.apk"
  [ -f "$APK" ] || APK="$BUILD_DIR/app/outputs/apk/release/app-release-unsigned.apk"
fi

if [ ! -f "$APK" ]; then
  echo "==> WARNING: build succeeded but no APK at $APK" >&2
  exit 1
fi

BYTES="$(stat -c %s "$APK")"
echo "==> APK: $APK ($(human_size "$BYTES"))"

# ---- Telegram delivery (signed + size rule) ----------------------------
if [ "$TASK" = "send" ]; then
  BASE="$(basename "$APK")"
  if [[ "$BASE" == *unsigned* ]]; then
    echo "==> NOT SENT: '$BASE' is unsigned (no release signingConfig in v1);"
    echo "    only signed APKs are delivered to Telegram."
    exit 0
  fi
  if [ "$BYTES" -gt "$MAX_TG_BYTES" ]; then
    echo "==> NOT SENT: $BASE is $(human_size "$BYTES") ($BYTES bytes), over the 50,000,000-byte limit."
    exit 0
  fi
  if [ ! -x "$TG_REPORT" ]; then
    echo "==> NOT SENT: Telegram sender missing or not executable: $TG_REPORT" >&2
    exit 1
  fi
  echo "==> Sending $BASE via tg_report.sh ..."
  if "$TG_REPORT" file "$APK"; then
    echo "==> SENT: $BASE"
  else
    rc=$?
    echo "==> SEND FAILED (tg_report.sh exit $rc). APK still at: $APK" >&2
    exit "$rc"
  fi
fi
