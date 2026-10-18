#!/usr/bin/env bash
#
# design_skills.sh — load every bundled Movid design skill in ONE call.
#
# Bundled skills live in: <repo>/design/skills/<name>/SKILL.md
# Bundled by: movid-design skill (.opencode/skills/movid-design/SKILL.md)
#
# Usage:
#   design_skills.sh                 Print every design/skills/*/SKILL.md concatenated
#                                    in deterministic alphabetical order ("one call" load).
#   design_skills.sh --list          List skill names with SKILL.md file sizes only.
#   design_skills.sh --grep <term>   Print matching lines with file context across all
#                                    bundled SKILL.md files.
#   design_skills.sh -h|--help       Show this help.
#
# Resolves the repo root from this script's location, so it works from any cwd.
# Performs no network calls.

set -euo pipefail

LC_ALL=C
export LC_ALL

usage() {
  cat <<'EOF'
Usage: design_skills.sh [--list] [--grep <term>]

  (no args)        Print every design/skills/*/SKILL.md concatenated in
                   deterministic alphabetical order ("one call" load).
  --list           List bundled skill names with SKILL.md file sizes only.
  --grep <term>    Print matching lines (with file context) across every
                   bundled SKILL.md.
  -h, --help       Show this help.

Resolves the repo root from this script's location, so it works from any cwd.
Performs no network calls.
EOF
}

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd -- "$SCRIPT_DIR/.." && pwd)"
SKILLS_DIR="$ROOT_DIR/design/skills"

if [[ ! -d "$SKILLS_DIR" ]]; then
  echo "error: skills directory not found: $SKILLS_DIR" >&2
  echo "hint: expected the bundled skills at <repo>/design/skills/<name>/SKILL.md" >&2
  exit 1
fi

mode="dump"
term=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --list)
      if [[ "$mode" != "dump" ]]; then
        echo "error: choose only one of --list or --grep" >&2
        exit 2
      fi
      mode="list"
      shift
      ;;
    --grep)
      if [[ "$mode" != "dump" ]]; then
        echo "error: choose only one of --list or --grep" >&2
        exit 2
      fi
      if [[ $# -lt 2 || -z "${2:-}" ]]; then
        echo "error: --grep requires a <term>" >&2
        usage >&2
        exit 2
      fi
      mode="grep"
      term="$2"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "error: unknown argument: $1" >&2
      usage >&2
      exit 2
      ;;
  esac
done

# Discover bundled skills, sorted by DIRECTORY NAME under LC_ALL=C so the
# order is deterministic and natural ("design" before "design-system").
# Sorting full paths instead would compare the "/" separator and invert
# such pairs, so sort the bare names here.
skill_names=()
skill_files=()
while IFS= read -r name; do
  [[ -n "$name" ]] || continue
  f="$SKILLS_DIR/$name/SKILL.md"
  [[ -f "$f" ]] || continue
  skill_names+=("$name")
  skill_files+=("$f")
done < <(find "$SKILLS_DIR" -mindepth 1 -maxdepth 1 -type d -printf '%f\n' | LC_ALL=C sort)

if (( ${#skill_files[@]} == 0 )); then
  echo "error: no SKILL.md files found under: $SKILLS_DIR" >&2
  exit 1
fi

case "$mode" in
  list)
    for i in "${!skill_files[@]}"; do
      bytes="$(wc -c < "${skill_files[$i]}" | tr -d '[:space:]')"
      printf '%-24s %8s bytes\n' "${skill_names[$i]}" "$bytes"
    done
    ;;

  grep)
    # -H: always print file names; -n: line numbers; -C 2: surrounding context.
    if ! grep -H -n -C 2 -- "$term" "${skill_files[@]}"; then
      echo "no matches for: $term" >&2
      exit 1
    fi
    ;;

  dump)
    for i in "${!skill_files[@]}"; do
      printf '# ===== %s =====\n\n' "${skill_names[$i]}"
      cat -- "${skill_files[$i]}"
      printf '\n'
    done
    ;;
esac
