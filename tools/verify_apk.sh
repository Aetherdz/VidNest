#!/usr/bin/env bash
# tools/verify_apk.sh - single-command verifier for a built Movid APK.
#
# Implements the AGENTS.md "Verification checklist before shipping" items that
# can be checked against a finished APK: size limit, signature, manifest policy
# (DESIGNER meta-data, allowBackup, permission allowlist, exported components)
# and the permanent zaikabdou designer fingerprint (manifest + dex).
#
# Usage: tools/verify_apk.sh [apk-path]
#
#   Default APK: /tmp/opencode/movid-build/app/outputs/apk/release/app-release.apk
#
# Exit codes:
#   0  all checks passed (SKIPs never fail the run)
#   1  real failure: APK missing, oversize, signature failure, fingerprint missing
#   2  usage error
#
# Missing tools degrade gracefully: apksigner falls back to keytool, aapt2
# falls back to a clearly-labelled best-effort strings scan of the binary
# AndroidManifest.xml, and anything else uncheckable becomes SKIP. Never runs
# Gradle and never prints a stack trace.

set -uo pipefail

APK="${1:-/tmp/opencode/movid-build/app/outputs/apk/release/app-release.apk}"
MAX_BYTES=50000000
TMPD=/tmp/opencode/verify-apk-tmp

usage() {
  cat <<'EOF'
Usage: tools/verify_apk.sh [apk-path]

  Verifies a built Movid APK against the shipping checklist in AGENTS.md:
  size limit, signature, manifest policy (DESIGNER meta-data, allowBackup,
  permission allowlist, exported components) and the zaikabdou dex
  fingerprint.

  Default apk-path: /tmp/opencode/movid-build/app/outputs/apk/release/app-release.apk
  Exit 0 = PASS (SKIPs allowed), 1 = real failure, 2 = usage error.
EOF
}

case "${1:-}" in -h|--help) usage; exit 0 ;; esac

FAIL_COUNT=0
note_fail() { FAIL_COUNT=$((FAIL_COUNT + 1)); }

# Per-section summary status: PASS / FAIL / SKIP / BEST-EFFORT
SEC1=PASS SEC2=PASS SEC3=PASS SEC4=PASS

human_size() {
  if command -v numfmt >/dev/null 2>&1; then
    numfmt --to=iec --suffix=B "$1"
  else
    printf '%s bytes' "$1"
  fi
}

# ---------------------------------------------------------------------------
# Tool discovery: build-tools/<highest-version>/<tool> under candidate SDKs.
# ---------------------------------------------------------------------------
find_build_tool() {
  # $1 = tool name (apksigner / aapt2). Prints path on success.
  local tool="$1" cand dir ver hit
  if command -v "$tool" >/dev/null 2>&1; then
    command -v "$tool"
    return 0
  fi
  for cand in "${ANDROID_HOME:-}" "${ANDROID_SDK_ROOT:-}" \
              "$HOME/android-sdk" "$HOME/Android/Sdk" /opt/android-sdk /usr/lib/android-sdk; do
    [ -n "$cand" ] || continue
    dir="$cand/build-tools"
    [ -d "$dir" ] || continue
    ver="$(ls "$dir" 2>/dev/null | sort -V | tail -1)"
    [ -n "$ver" ] || continue
    hit="$dir/$ver/$tool"
    if [ -f "$hit" ]; then
      printf '%s\n' "$hit"
      return 0
    fi
  done
  return 1
}

# awk program: turns `aapt2 dump xmltree` output into simple records:
#   PERM|<name>|<maxSdkVersion or ->
#   APP|allowBackup|<value or unset>
#   COMP|<element>|<name>|<exported or unset>
#   META|<name>|<value>
XMLTREE_PARSE_AWK='
  function indent_of(s,   n) { n = match(s, /[^ ]/); return (n > 0 ? n - 1 : length(s)) }
  function flush_perm() {
    if (cur_is_perm) print "PERM|" (perm==""?"?":perm) "|" (perm_max==""?"-":perm_max)
    cur_is_perm = 0; perm = ""; perm_max = ""
  }
  function flush_comp() {
    if (cur_is_comp) print "COMP|" cur_elem "|" (c_name==""?"?":c_name) "|" (c_exp==""?"unset":c_exp)
    cur_is_comp = 0; c_name = ""; c_exp = ""
  }
  function flush_meta() {
    if (cur_is_meta) print "META|" (m_name==""?"?":m_name) "|" m_val
    cur_is_meta = 0; m_name = ""; m_val = ""
  }
  /^[ ]*E: / {
    flush_perm(); flush_comp(); flush_meta()
    cur_elem = $0
    sub(/^ *E: /, "", cur_elem)
    sub(/ \(line=.*$/, "", cur_elem)
    cur_indent = indent_of($0)
    cur_is_perm  = (cur_elem == "uses-permission" || cur_elem == "uses-permission-sdk-23")
    cur_is_comp  = (cur_elem == "activity" || cur_elem == "service" || cur_elem == "receiver" || cur_elem == "provider")
    cur_is_meta  = (cur_elem == "meta-data")
    next
  }
  /^[ ]*A: / {
    if (indent_of($0) <= cur_indent) next
    line = $0
    sub(/^ *A: /, "", line)
    if (line ~ /\(0x[0-9a-fA-F]+\)=/) {
      key = line; sub(/\(0x[0-9a-fA-F]+\).*$/, "", key)
      val = line; sub(/^.*\(0x[0-9a-fA-F]+\)=/, "", val)
    } else if (index(line, "=") > 0) {
      key = line; sub(/=.*$/, "", key)
      val = line; sub(/^[^=]*=/, "", val)
    } else { next }
    sub(/ \(Raw: .*\)$/, "", val)
    gsub(/^"|"$/, "", val)
    n = split(key, kparts, ":"); local = kparts[n]
    if (cur_is_perm) {
      if (local == "name") perm = val
      if (local == "maxSdkVersion") perm_max = val
    } else if (cur_elem == "application") {
      if (local == "allowBackup") allow = val
    } else if (cur_is_comp) {
      if (local == "name") c_name = val
      if (local == "exported") c_exp = val
    } else if (cur_is_meta) {
      if (local == "name") m_name = val
      if (local == "value") m_val = val
    }
  }
  END {
    flush_perm(); flush_comp(); flush_meta()
    print "APP|allowBackup|" (allow==""?"unset":allow)
  }
'

# ---------------------------------------------------------------------------
# Section 1: APK existence + size
# ---------------------------------------------------------------------------
echo "==> Movid APK verifier (checklist from AGENTS.md)"
echo "==> APK: $APK"
echo

if [ ! -f "$APK" ]; then
  echo "==> 1/4 APK file"
  echo "    FAIL: no such file: $APK"
  echo "    Build it first, e.g.: tools/smart_build.sh release"
  echo
  echo "==> SUMMARY"
  echo "    1. APK file ......... FAIL"
  echo "    2. Signature ........ SKIP"
  echo "    3. Manifest ......... SKIP"
  echo "    4. Dex fingerprint .. SKIP"
  echo "==> RESULT: FAIL (APK not found)"
  exit 1
fi

BYTES="$(stat -c %s "$APK" 2>/dev/null || echo 0)"
echo "==> 1/4 APK file"
echo "    Path : $APK"
echo "    Size : $(human_size "$BYTES") ($BYTES bytes)"
if [ "$BYTES" -gt "$MAX_BYTES" ]; then
  echo "    FAIL: exceeds the $MAX_BYTES-byte delivery limit."
  SEC1=FAIL
  note_fail
else
  echo "    OK  : within the $MAX_BYTES-byte limit."
fi
echo

# ---------------------------------------------------------------------------
# Section 2: signature
# ---------------------------------------------------------------------------
echo "==> 2/4 Signature"
APKSIGNER="$(find_build_tool apksigner)"
if [ -n "$APKSIGNER" ]; then
  echo "    Tool : apksigner ($APKSIGNER)"
  SIG_OUT="$("$APKSIGNER" verify --print-certs "$APK" 2>&1)"
  SIG_RC=$?
  printf '%s\n' "$SIG_OUT" \
    | grep -E 'Signer #1 certificate DN|SHA-256 digest' \
    | head -4 | sed 's/^/    /'
  if [ "$SIG_RC" -eq 0 ]; then
    echo "    OK  : apksigner verify passed (cryptographic verification)."
  else
    echo "    FAIL: apksigner verify failed (exit $SIG_RC); last lines:"
    printf '%s\n' "$SIG_OUT" | tail -5 | sed 's/^/      /'
    SEC2=FAIL
    note_fail
  fi
elif command -v keytool >/dev/null 2>&1; then
  echo "    Tool : apksigner NOT FOUND (no Android SDK build-tools on this machine)"
  echo "    Fallback: keytool -printcert -jarfile"
  KT_OUT="$(keytool -printcert -jarfile "$APK" 2>&1)"
  KT_RC=$?
  # keytool exits 0 even when it just prints "Not a signed jar file";
  # trust the message, not the exit code.
  if [ "$KT_RC" -eq 0 ] && ! printf '%s\n' "$KT_OUT" | grep -q 'Not a signed jar file'; then
    printf '%s\n' "$KT_OUT" | grep -E 'Owner:|SHA256:' | head -4 | sed 's/^/    /'
    echo "    OK  : jar (v1) signature present; signer certificate printed above."
    echo "    NOTE: keytool reads v1 signing only; it does not fully verify v2/v3."
  else
    # keytool cannot read v2/v3-only signatures; look for an APK signing block.
    if tail -c 410000 "$APK" 2>/dev/null | grep -aq 'APK Sig Block 42'; then
      echo "    SKIP: keytool could not read a v1 signature, but an APK v2/v3 signing"
      echo "          block is present. Install Android build-tools (apksigner) to"
      echo "          verify it properly. SKIP, not a failure."
      SEC2=SKIP
    else
      echo "    FAIL: APK appears unsigned (no readable v1 signature, no v2/v3 block)."
      SEC2=FAIL
      note_fail
    fi
  fi
else
  echo "    Tool : apksigner NOT FOUND; keytool also unavailable."
  echo "    SKIP: signature not checked on this machine."
  SEC2=SKIP
fi
echo

# ---------------------------------------------------------------------------
# Section 3: manifest
# ---------------------------------------------------------------------------
echo "==> 3/4 Manifest"

# Permission allowlist from AGENTS.md (least-privilege manifest rule):
# app-declared permissions + documented merged library permissions
# (androidx.work: WAKE_LOCK, RECEIVE_BOOT_COMPLETED; androidx.core signature
# permission DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION).
ALLOWED_PERMS=" INTERNET ACCESS_NETWORK_STATE FOREGROUND_SERVICE FOREGROUND_SERVICE_DATA_SYNC FOREGROUND_SERVICE_MEDIA_PLAYBACK POST_NOTIFICATIONS WRITE_EXTERNAL_STORAGE WAKE_LOCK RECEIVE_BOOT_COMPLETED DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION "
perm_allowed() { case "$ALLOWED_PERMS" in *" $1 "*) return 0 ;; esac; return 1; }

AAPT2="$(find_build_tool aapt2)"
MANIFEST_KNOWN=0

if [ -n "$AAPT2" ]; then
  echo "    Tool : aapt2 ($AAPT2) -- authoritative xmltree dump"
  XT_OUT="$("$AAPT2" dump xmltree --file AndroidManifest.xml "$APK" 2>&1)"
  if [ $? -ne 0 ]; then
    MANIFEST_KNOWN=1
    SEC3=FAIL
    echo "    FAIL: aapt2 could not dump AndroidManifest.xml; last lines:"
    printf '%s\n' "$XT_OUT" | tail -4 | sed 's/^/      /'
    note_fail
  else
    MANIFEST_KNOWN=1
    PARSED="$(printf '%s\n' "$XT_OUT" | awk "$XMLTREE_PARSE_AWK" 2>/dev/null)"
    [ -n "$PARSED" ] || echo "    WARN: xmltree parsed to nothing; treating checks as skipped."

    # 3a. DESIGNER meta-data (permanent fingerprint; FAIL when missing/wrong)
    DESIGNER_LINE="$(printf '%s\n' "$PARSED" | grep -m1 '^META|com\.movid\.app\.DESIGNER|')"
    if [ -z "$DESIGNER_LINE" ]; then
      echo "    FAIL: meta-data com.movid.app.DESIGNER is MISSING from the manifest."
      SEC3=FAIL; note_fail
    else
      DESIGNER_VAL="${DESIGNER_LINE##*|}"
      if [ "$DESIGNER_VAL" = "zaikabdou" ]; then
        echo "    OK  : meta-data com.movid.app.DESIGNER = zaikabdou"
      else
        echo "    FAIL: com.movid.app.DESIGNER = \"$DESIGNER_VAL\" (expected \"zaikabdou\")."
        SEC3=FAIL; note_fail
      fi
    fi

    # 3b. allowBackup (flag only; not a hard failure per exit-code contract)
    ALLOW_VAL="$(printf '%s\n' "$PARSED" | grep -m1 '^APP|allowBackup|' | cut -d'|' -f3)"
    case "$ALLOW_VAL" in
      false)  echo "    OK  : application android:allowBackup = false" ;;
      unset|"") echo "    WARN: android:allowBackup not explicitly set (platform default is true)." ;;
      *)      echo "    WARN: android:allowBackup = $ALLOW_VAL (expected false)." ;;
    esac

    # 3c. permissions vs allowlist
    PERM_ISSUES=0 PERM_TOTAL=0
    while IFS='|' read -r _tag pname pmax; do
      [ -n "$pname" ] || continue
      PERM_TOTAL=$((PERM_TOTAL + 1))
      short="${pname##*.}"
      if ! perm_allowed "$short"; then
        echo "    FLAG: permission $pname is NOT in the AGENTS.md allowlist."
        PERM_ISSUES=$((PERM_ISSUES + 1))
      elif [ "$short" = "WRITE_EXTERNAL_STORAGE" ]; then
        if [ "$pmax" != "-" ] && [ "$pmax" -le 28 ] 2>/dev/null; then
          echo "    OK  : permission $pname (maxSdkVersion=$pmax)"
        else
          echo "    FLAG: permission $pname must declare maxSdkVersion <= 28 (got: ${pmax})."
          PERM_ISSUES=$((PERM_ISSUES + 1))
        fi
      else
        echo "    OK  : permission $pname"
      fi
    done <<EOF
$(printf '%s\n' "$PARSED" | grep '^PERM|')
EOF
    [ "$PERM_TOTAL" -eq 0 ] && echo "    WARN: no uses-permission entries found."
    [ "$PERM_ISSUES" -eq 0 ] && [ "$PERM_TOTAL" -gt 0 ] && echo "    OK  : all $PERM_TOTAL declared permissions are allowlisted."

    # 3d. exported components (informational; expected MainActivity + PlaybackService)
    COMP_ROWS="$(printf '%s\n' "$PARSED" | grep '^COMP|')"
    if [ -n "$COMP_ROWS" ]; then
      echo "    Components (name, exported flag as declared):"
      printf '%s\n' "$COMP_ROWS" | while IFS='|' read -r _tag ctype cname cexp; do
        echo "      - $ctype $cname (exported=$cexp)"
      done
      EXPORTED_ALL="$(printf '%s\n' "$COMP_ROWS" | grep '|true$' \
        | sed 's/^COMP|[^|]*|//; s/|[^|]*$//' | sort)"
      EXPORTED_NOW="$(printf '%s\n' "$EXPORTED_ALL" | grep '^com\.movid\.app\.' || true)"
      EXPORTED_LIB="$(printf '%s\n' "$EXPORTED_ALL" | grep -v '^com\.movid\.app\.' || true)"
      if [ -n "$EXPORTED_LIB" ]; then
        echo "    INFO: library-own exported components (not compared):"
        printf '%s\n' "$EXPORTED_LIB" | sed 's/^/        /'
      fi
      EXPECTED_EXPORTED="$(printf 'com.movid.app.MainActivity\ncom.movid.app.player.PlaybackService')"
      if [ "$EXPORTED_NOW" = "$EXPECTED_EXPORTED" ]; then
        echo "    OK  : app-owned exported set matches exactly MainActivity + PlaybackService."
      elif [ -z "$EXPORTED_NOW" ]; then
        echo "    WARN: no app-owned exported components in the dump."
      else
        echo "    FLAG: app-owned exported set differs from expected (MainActivity + PlaybackService):"
        printf '%s\n' "$EXPORTED_NOW" | sed 's/^/        /'
        echo "        Informational - review before shipping."
      fi
    else
      echo "    WARN: no components parsed from the manifest dump."
    fi
  fi
elif mkdir -p "$TMPD" && unzip -o -q "$APK" AndroidManifest.xml -d "$TMPD" 2>/dev/null \
     && [ -s "$TMPD/AndroidManifest.xml" ]; then
  SEC3=BEST-EFFORT
  echo "    Tool : aapt2 NOT FOUND (no Android SDK build-tools on this machine)"
  echo "    BEST-EFFORT: strings scan of the binary AndroidManifest.xml."
  echo "                 Attribute values (allowBackup, exported, maxSdkVersion)"
  echo "                 cannot be read reliably without aapt2."
  # aapt2 string pools are commonly UTF-16LE; scan both encodings.
  STRING_POOL="$( { strings -n 5 "$TMPD/AndroidManifest.xml" 2>/dev/null
                    strings -e l -n 5 "$TMPD/AndroidManifest.xml" 2>/dev/null
                  } | sed 's/^[^A-Za-z0-9]*//')"
  if printf '%s' "$STRING_POOL" | grep -q 'com.movid.app.DESIGNER'; then
    if printf '%s' "$STRING_POOL" | grep -q 'zaikabdou'; then
      echo "    OK  : com.movid.app.DESIGNER and \"zaikabdou\" both present in manifest strings."
    else
      echo "    FAIL: com.movid.app.DESIGNER present but \"zaikabdou\" NOT FOUND."
      SEC3=FAIL; note_fail
    fi
  else
    echo "    FAIL: com.movid.app.DESIGNER NOT FOUND in manifest strings."
    SEC3=FAIL; note_fail
  fi
  PERMS_FOUND="$(printf '%s\n' "$STRING_POOL" | grep -oE 'android\.permission\.[A-Za-z_]+' | sort -u)"
  if [ -n "$PERMS_FOUND" ]; then
    echo "    Permissions seen in manifest string pool:"
    while read -r p; do
      [ -n "$p" ] || continue
      short="${p##*.}"
      if perm_allowed "$short"; then
        echo "      - $p (allowlisted)"
      else
        echo "      - $p FLAG: not in allowlist"
      fi
    done <<EOF
$PERMS_FOUND
EOF
  else
    echo "    INFO: no android.permission.* strings found in the manifest pool."
  fi
  printf '%s\n' "$STRING_POOL" | grep -q 'allowBackup' \
    && echo "    INFO: allowBackup attribute referenced; value unknown in best-effort mode."
  for comp in MainActivity PlaybackService; do
    printf '%s\n' "$STRING_POOL" | grep -q "$comp" \
      && echo "    INFO: component token \"$comp\" seen in manifest strings."
  done
  true
else
  SEC3=SKIP
  echo "    Tool : aapt2 NOT FOUND and AndroidManifest.xml could not be extracted."
  echo "    SKIP: manifest not checked."
fi
echo

# ---------------------------------------------------------------------------
# Section 4: dex fingerprint and BuildConfig.DESIGNER field
# ---------------------------------------------------------------------------
echo "==> 4/4 Dex fingerprint"
rm -rf "$TMPD"
if mkdir -p "$TMPD" && unzip -o -q "$APK" 'classes*.dex' -d "$TMPD" 2>/dev/null \
   && ls "$TMPD"/classes*.dex >/dev/null 2>&1; then
  FOUND_FILES="$(grep -al 'zaikabdou' "$TMPD"/classes*.dex 2>/dev/null \
    | xargs -r -n1 basename | tr '\n' ' ')"
  if [ -n "$FOUND_FILES" ]; then
    echo "    OK  : \"zaikabdou\" FOUND in dex: $FOUND_FILES"
  else
    echo "    FAIL: \"zaikabdou\" NOT FOUND in any classes*.dex"
    echo "          (BuildConfig.DESIGNER stripped, missing, or wrong package)."
    SEC4=FAIL; note_fail
  fi
  DEXDUMP="$(find_build_tool dexdump)"
  if [ -n "$DEXDUMP" ]; then
    DEXDUMP_OUT="$TMPD/dexdump.txt"
    : > "$DEXDUMP_OUT"
    DEXDUMP_OK=1
    for dex in "$TMPD"/classes*.dex; do
      if ! "$DEXDUMP" -d "$dex" >>"$DEXDUMP_OUT" 2>/dev/null; then
        DEXDUMP_OK=0
        break
      fi
    done
    if [ "$DEXDUMP_OK" -eq 1 ] && awk '
      /Class descriptor[[:space:]]*:[[:space:]]*'"'"'Lcom\/movid\/app\/BuildConfig;'"'"'/ { in_config = 1; next }
      /Class descriptor[[:space:]]*:/ { in_config = 0 }
      in_config && /name[[:space:]]*:[[:space:]]*'"'"'DESIGNER'"'"'/ { has_field = 1 }
      in_config && /value[[:space:]]*:[[:space:]]*"zaikabdou"/ { has_value = 1 }
      END { exit !(has_field && has_value) }
    ' "$DEXDUMP_OUT"; then
      echo "    OK  : BuildConfig.DESIGNER field retained in dex with value zaikabdou."
    else
      echo "    FAIL: BuildConfig.DESIGNER field/value not present in dex."
      SEC4=FAIL
      note_fail
    fi
  elif grep -aq 'Lcom/movid/app/BuildConfig;' "$TMPD"/classes*.dex 2>/dev/null \
       && grep -aq 'DESIGNER' "$TMPD"/classes*.dex 2>/dev/null \
       && grep -aq 'zaikabdou' "$TMPD"/classes*.dex 2>/dev/null; then
    echo "    BEST-EFFORT: BuildConfig descriptor, DESIGNER, and fingerprint strings found in dex."
  else
    echo "    FAIL: BuildConfig.DESIGNER or its zaikabdou value not found in dex."
    SEC4=FAIL
    note_fail
  fi
else
  SEC4=FAIL
  echo "    FAIL: no classes*.dex found in the APK (not a valid Android app package)."
  note_fail
fi
rm -rf "$TMPD"
echo

# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------
echo "==> SUMMARY"
echo "    1. APK file ......... $SEC1"
echo "    2. Signature ........ $SEC2"
echo "    3. Manifest ......... $SEC3"
echo "    4. Dex fingerprint .. $SEC4"
if [ "$FAIL_COUNT" -eq 0 ]; then
  echo "==> RESULT: PASS"
  exit 0
else
  echo "==> RESULT: FAIL ($FAIL_COUNT failure(s) - see sections above)"
  exit 1
fi
