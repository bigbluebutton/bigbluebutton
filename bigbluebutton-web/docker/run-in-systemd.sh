#!/usr/bin/env bash
# run-in-systemd.sh

# INSECURE VERSION: Run without any restrictions!

set -euo pipefail

if [[ $# -lt 2 ]]; then
  echo "Usage: $0 <timeout-seconds> <command> [args …]" >&2
  exit 1
fi

# Remove first argument (timeout)
shift

"$@"

exit $?   # propagate the child’s exit status
