#!/usr/bin/env sh
# Compare an extracted "Sansa Frontend.zip" tree against this package's public/
# Works from any current directory — paths are resolved from this script's location.
#
# Usage:
#   sh /path/to/repo/artifacts/sansa-backend/scripts/compare-sansa-frontend-zip.sh "/path/to/Sansa Frontend.zip"
# Or from the backend package root:
#   sh scripts/compare-sansa-frontend-zip.sh "/path/to/Sansa Frontend.zip"
# Or:
#   FRONTEND_ZIP="/path/to/Sansa Frontend.zip" sh scripts/compare-sansa-frontend-zip.sh
#
# Requires: unzip, diff (standard on Linux / cPanel hosts).

set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname "$0")" && pwd)
BACKEND_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
PUBLIC_DIR="$BACKEND_ROOT/public"

ZIP_PATH=${1:-${FRONTEND_ZIP:-}}

if [ -z "$ZIP_PATH" ]; then
  echo "compare-sansa-frontend-zip.sh: missing zip path." >&2
  echo "" >&2
  echo "You must run this script from inside a clone of the santhosh-sansa repo" >&2
  echo "(so that artifacts/sansa-backend/... exists), or pass the full path to the script." >&2
  echo "" >&2
  echo "Usage:" >&2
  echo "  sh /path/to/repo/artifacts/sansa-backend/scripts/compare-sansa-frontend-zip.sh \"/path/to/Sansa Frontend.zip\"" >&2
  echo "  FRONTEND_ZIP=\"/path/to/Sansa Frontend.zip\" sh .../compare-sansa-frontend-zip.sh" >&2
  exit 1
fi

if [ ! -f "$ZIP_PATH" ]; then
  echo "compare-sansa-frontend-zip.sh: file not found: $ZIP_PATH" >&2
  exit 1
fi

if [ ! -d "$PUBLIC_DIR" ]; then
  echo "compare-sansa-frontend-zip.sh: expected public dir missing: $PUBLIC_DIR" >&2
  echo "(Run from repo checkout; script lives under artifacts/sansa-backend/scripts/.)" >&2
  exit 1
fi

if ! command -v unzip >/dev/null 2>&1; then
  echo "compare-sansa-frontend-zip.sh: 'unzip' not found in PATH." >&2
  exit 1
fi

if ! command -v diff >/dev/null 2>&1; then
  echo "compare-sansa-frontend-zip.sh: 'diff' not found in PATH." >&2
  exit 1
fi

TMP=$(mktemp -d)
cleanup() {
  rm -rf "$TMP"
}
trap cleanup EXIT

unzip -q -o "$ZIP_PATH" -d "$TMP"

# Prefer a top-level "public/" inside the archive; else use directory of first index.html.
ROOT=""
if [ -f "$TMP/public/index.html" ]; then
  ROOT="$TMP/public"
else
  INDEX=$(find "$TMP" -name index.html 2>/dev/null | head -n 1)
  if [ -z "$INDEX" ]; then
    echo "compare-sansa-frontend-zip.sh: could not find index.html inside zip after extract." >&2
    echo "Listing top of archive:" >&2
    ls -la "$TMP" >&2 || true
    exit 1
  fi
  ROOT=$(dirname "$INDEX")
fi

echo "=== Sansa frontend zip compare ==="
echo "Zip:          $ZIP_PATH"
echo "Zip web root: $ROOT"
echo "Repo public:  $PUBLIC_DIR"
echo ""

set +e
diff -rq "$ROOT" "$PUBLIC_DIR"
DIFF_STATUS=$?
set -e

echo ""
if [ "$DIFF_STATUS" -eq 0 ]; then
  echo "Result: no differences reported between zip web root and public/."
else
  echo "Result: differences found (diff exit $DIFF_STATUS). Update public/ or the zip as needed."
fi

exit "$DIFF_STATUS"
