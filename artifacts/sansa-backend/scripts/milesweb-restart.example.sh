#!/usr/bin/env sh
# -----------------------------------------------------------------------------
# MilesWeb / cPanel — RESTART HELPER for GitHub Actions (or manual SSH).
#
# 1) On the server, copy and edit (paths are examples):
#      mkdir -p "$HOME/bin"
#      cp scripts/milesweb-restart.example.sh "$HOME/bin/sansa-restart.sh"
#      chmod +x "$HOME/bin/sansa-restart.sh"
#      nano "$HOME/bin/sansa-restart.sh"   # set SANSA_APP_ROOT + uncomment ONE strategy
#
# 2) GitHub → repo → Settings → Secrets → Actions → add:
#      MILESWEB_RESTART_CMD=bash /home/YOURUSER/bin/sansa-restart.sh
#    (Use the real absolute path; $HOME is not always expanded in secrets UI.)
#
# cPanel has no single public “restart API” for all accounts — you must use
# what MilesWeb documents (touch file, selector CLI, or manual + this script as reminder).
# -----------------------------------------------------------------------------

set -eu

# Same folder as “Application root” in cPanel → Setup Node.js App.
SANSA_APP_ROOT="${SANSA_APP_ROOT:-$HOME/repos/santhosh-sansa/artifacts/sansa-backend}"

log() { printf '%s %s\n' "$(date -u +"%Y-%m-%dT%H:%M:%SZ")" "$*"; }

# --- Uncomment ONE block that matches your host (ask MilesWeb if unsure) ---

# A) Example: trigger file (ONLY if your host documents this exact mechanism):
# mkdir -p "$SANSA_APP_ROOT/tmp"
# touch "$SANSA_APP_ROOT/tmp/restart.txt"

# B) Example: CloudLinux “selector” style (syntax varies by host — confirm with MilesWeb):
# if command -v cloudlinux-selector >/dev/null 2>&1; then
#   cloudlinux-selector run --json --interpreter nodejs --app-root "$SANSA_APP_ROOT" restart || true
# fi

# C) Example: you run Node yourself with a PID file (you maintain start/stop):
# PIDF="$SANSA_APP_ROOT/.sansa.pid"
# test -f "$PIDF" && kill "$(cat "$PIDF")" 2>/dev/null || true
# cd "$SANSA_APP_ROOT" && nohup node index.cjs >>"$SANSA_APP_ROOT/../logs/sansa.log" 2>&1 & echo $! >"$PIDF"

# Default: safe no-op — reminds you to restart in cPanel until A/B/C is wired:
log "sansa-restart: no-op. Edit this script for your host. SANSA_APP_ROOT=$SANSA_APP_ROOT"
log "After git pull: open cPanel → Setup Node.js App → Restart (until automation is configured)."

exit 0
