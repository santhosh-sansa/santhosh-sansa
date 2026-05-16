#!/bin/sh
# Run syntax checks when `npm` / `node` are not on default SSH PATH (cPanel / CloudLinux).
# Usage (from this package root):
#   sh scripts/verify-from-ssh.sh
# Or: SANSA_NODE=/opt/alt/alt-nodejs20/root/usr/bin/node sh scripts/verify-from-ssh.sh

set -e
cd "$(dirname "$0")/.."
ROOT=$(pwd)

NODE_BIN=""
if [ -n "${SANSA_NODE:-}" ] && [ -x "${SANSA_NODE}" ]; then
  NODE_BIN="${SANSA_NODE}"
fi

if [ -z "${NODE_BIN}" ] && [ -d "${HOME}/nodevenv" ]; then
  for d in "${HOME}"/nodevenv/*/bin/node; do
    if [ -x "$d" ]; then
      NODE_BIN="$d"
      break
    fi
  done
fi

if [ -z "${NODE_BIN}" ]; then
  for cand in \
    /opt/alt/alt-nodejs22/root/usr/bin/node \
    /opt/alt/alt-nodejs20/root/usr/bin/node \
    /opt/alt/alt-nodejs18/root/usr/bin/node \
    /opt/cpanel/ea-nodejs20/bin/node \
    /usr/bin/node
  do
    if [ -x "$cand" ]; then
      NODE_BIN="$cand"
      break
    fi
  done
fi

if [ -z "${NODE_BIN}" ] && command -v node >/dev/null 2>&1; then
  NODE_BIN=$(command -v node)
fi

if [ -z "${NODE_BIN}" ] || [ ! -x "${NODE_BIN}" ]; then
  echo "SANSA verify: could not find node. Set SANSA_NODE to the full path, e.g." >&2
  echo "  export SANSA_NODE=/opt/alt/alt-nodejs20/root/usr/bin/node" >&2
  exit 1
fi

echo "SANSA verify: using ${NODE_BIN}"
exec "${NODE_BIN}" "${ROOT}/scripts/verify-sansa.cjs"
