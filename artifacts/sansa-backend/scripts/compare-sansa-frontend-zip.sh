#!/usr/bin/env sh
# Compare "Sansa Frontend.zip" contents against artifacts/sansa-backend/public/.
# Paths are resolved from this script's location (any cwd is fine).
#
# Zip selection (first match wins):
#   1) First argument, if it is a readable file
#   2) SANSA_FRONTEND_ZIP, if set and readable
#   3) FRONTEND_ZIP, if set and readable
#   4) <repo root>/Sansa Frontend.zip (repo root = three levels above this script)
#
# Usage:
#   sh .../compare-sansa-frontend-zip.sh
#   sh .../compare-sansa-frontend-zip.sh "/path/to/Sansa Frontend.zip"
#   SANSA_FRONTEND_ZIP="/path/to/Sansa Frontend.zip" sh .../compare-sansa-frontend-zip.sh
#
# Requires: unzip, diff.

set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname "$0")" && pwd)
BACKEND_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
PUBLIC_DIR="$BACKEND_ROOT/public"
WORKSPACE=$(CDPATH= cd -- "$SCRIPT_DIR/../../.." && pwd)
DEFAULT_ZIP="$WORKSPACE/Sansa Frontend.zip"

ZIP_PATH=""
if [ -n "${1:-}" ]; then
  if [ ! -f "$1" ]; then
    echo "compare-sansa-frontend-zip.sh: first argument is not a readable file: $1" >&2
    exit 1
  fi
  ZIP_PATH=$1
elif [ -n "${SANSA_FRONTEND_ZIP:-}" ] && [ -f "$SANSA_FRONTEND_ZIP" ]; then
  ZIP_PATH=$SANSA_FRONTEND_ZIP
elif [ -n "${FRONTEND_ZIP:-}" ] && [ -f "$FRONTEND_ZIP" ]; then
  ZIP_PATH=$FRONTEND_ZIP
elif [ -f "$DEFAULT_ZIP" ]; then
  ZIP_PATH=$DEFAULT_ZIP
else
  echo "compare-sansa-frontend-zip.sh: no zip found." >&2
  echo "Pass a path: sh .../compare-sansa-frontend-zip.sh \"/path/to/Sansa Frontend.zip\"" >&2
  echo "Or set SANSA_FRONTEND_ZIP / FRONTEND_ZIP, or place Sansa Frontend.zip at: $DEFAULT_ZIP" >&2
  exit 1
fi

if [ ! -d "$PUBLIC_DIR" ]; then
  echo "compare-sansa-frontend-zip.sh: expected public dir missing: $PUBLIC_DIR" >&2
  exit 1
fi

if ! command -v unzip >/dev/null 2>&1; then
  echo "compare-sansa-frontend-zip.sh: unzip not found in PATH." >&2
  exit 1
fi

if ! command -v diff >/dev/null 2>&1; then
  echo "compare-sansa-frontend-zip.sh: diff not found in PATH." >&2
  exit 1
fi

TMP=$(mktemp -d)
cleanup() {
  rm -rf "$TMP"
}
trap cleanup EXIT

mkdir -p "$TMP/extract"
unzip -q -o "$ZIP_PATH" -d "$TMP/extract"

# Prefer .../public/index.html inside the archive; else top-level index.html; else first index.html.
ROOT=""
if [ -f "$TMP/extract/public/index.html" ]; then
  ROOT="$TMP/extract/public"
elif [ -f "$TMP/extract/index.html" ]; then
  ROOT="$TMP/extract"
else
  INDEX=$(find "$TMP/extract" -name index.html 2>/dev/null | head -n 1)
  if [ -z "$INDEX" ]; then
    echo "compare-sansa-frontend-zip.sh: could not find index.html inside zip." >&2
    ls -la "$TMP/extract" >&2 || true
    exit 1
  fi
  ROOT=$(dirname "$INDEX")
fi

echo "=== Sansa frontend zip compare ==="
echo "ZIP (resolved): $ZIP_PATH"
echo "Zip web root:   $ROOT"
echo "Repo public:    $PUBLIC_DIR"
echo ""

set +e
diff -rq "$ROOT" "$PUBLIC_DIR"
DIFF_STATUS=$?
set -e

echo ""
if [ "$DIFF_STATUS" -eq 0 ]; then
  echo "Result: no differences reported between zip web root and public/."
else
  echo "Result: differences found (diff exit $DIFF_STATUS)."
fi

echo ""
echo "Policy: repo public/ is source of truth. Do not copy api/.htaccess from zip (see root .gitignore / public/api/README.md)."
echo "If the zip is older, only add missing static helpers (e.g. .well-known) or docs — never downgrade app.js / page.html."

exit "$DIFF_STATUS"
