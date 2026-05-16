#!/usr/bin/env sh
# Compare "Sansa Frontend.zip" (repo root) against artifacts/sansa-backend/public.
# Usage (from anywhere):
#   sh artifacts/sansa-backend/scripts/compare-sansa-frontend-zip.sh
# Optional:
#   SANSA_FRONTEND_ZIP=/path/to/Sansa\ Frontend.zip sh ...

set -e
SCRIPT_DIR=$(CDPATH= cd -- "$(dirname "$0")" && pwd)
BACKEND_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
WORKSPACE=$(CDPATH= cd -- "$SCRIPT_DIR/../../.." && pwd)
ZIP=${SANSA_FRONTEND_ZIP:-"$WORKSPACE/Sansa Frontend.zip"}
PUBLIC="$BACKEND_ROOT/public"

if ! test -f "$ZIP"; then
  echo "ZIP not found: $ZIP" >&2
  exit 1
fi
if ! test -d "$PUBLIC"; then
  echo "public/ not found: $PUBLIC" >&2
  exit 1
fi

TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

unzip -q -o "$ZIP" -d "$TMP/extract"
echo "=== diff -rq (zip root vs public/) ==="
echo "ZIP: $ZIP"
echo "PUBLIC: $PUBLIC"
echo ""
diff -rq "$TMP/extract" "$PUBLIC" || true
echo ""
echo "Policy: repo public/ is source of truth. Do not copy api/.htaccess from zip (see root .gitignore)."
echo "If zip is older, only add missing static helpers (e.g. .well-known) or docs — never downgrade app.js / page.html."
