#!/usr/bin/env bash
# run-in-systemd.sh
# Run a command in a hardened transient user-level systemd unit.
#
# Usage:  run-in-systemd.sh <timeout-seconds> <command> [args …]
#
# Environment variables (override as needed creating a file at /etc/bigbluebutton/bbb-shared-notes-server.env):
#   BBB_BLOCKNOTE_DIR   Extra directory that must stay writable (default: /tmp/shared-notes-dropbox/)
#   BBB_BLOCKNOTE_CONVERSION_MEMORY_HIGH        Soft memory limit in bytes or systemd size suffix (default: 512M)
#   BBB_BLOCKNOTE_CONVERSION_MEMORY_MAX         Hard memory limit (default: 640M)

set -euo pipefail

if [[ $# -lt 2 ]]; then
  echo "Usage: $0 <timeout-seconds> <command> [args …]" >&2
  exit 1
fi

timeout_secs="$1"; shift

if [[ -z ${XDG_RUNTIME_DIR-} ]] || [[ ! -d $XDG_RUNTIME_DIR ]]; then
  echo "XDG_RUNTIME_DIR is not available, check user session manager" >&2
  exit 1
fi

: "${BBB_BLOCKNOTE_DIR:=/tmp/shared-notes-dropbox/}"
: "${BBB_BLOCKNOTE_CONVERSION_MEMORY_HIGH:=512M}"
: "${BBB_BLOCKNOTE_CONVERSION_MEMORY_MAX:=640M}"

systemd-run --user --pipe --wait --quiet                              \
  --unit=bbb-shared-notes-server-run-in-systemd-$$                    \
  --description="bbb-shared-notes-server run-in-systemd $*"           \
  --property=RuntimeMaxSec="${timeout_secs}"                          \
  --property=ProtectSystem=strict                                     \
  --property=ProtectHome=yes                                          \
  --property=PrivateTmp=true                                          \
  --property=PrivateNetwork=true                                      \
  --property=WorkingDirectory="${BBB_BLOCKNOTE_DIR}"                  \
  --property=ReadWritePaths="${BBB_BLOCKNOTE_DIR}"                    \
  --property=NoNewPrivileges=true                                     \
  --property=RestrictRealtime=true                                    \
  --property=IPAddressDeny=any                                        \
  --property=SystemCallFilter=~@mount                                 \
  --property=MemoryHigh="${BBB_BLOCKNOTE_CONVERSION_MEMORY_HIGH}"     \
  --property=MemoryMax="${BBB_BLOCKNOTE_CONVERSION_MEMORY_MAX}"       \
  --property=MemorySwapMax=0                                          \
  --property=UMask=0022                                               \
  --property=CollectMode=inactive-or-failed                           \
  "$@"

exit $?   # propagate the child’s exit status
