#!/usr/bin/env bash
# run-in-systemd.sh

# INSECURE VERSION: Run without most restrictions!

set -euo pipefail

if [[ $# -lt 2 ]]; then
  echo "Usage: $0 <timeout-seconds> <command> [args …]" >&2
  exit 1
fi

timeout_secs="$1"; shift

: "${BBB_PRESENTATION_DIR:=/var/bigbluebutton/}"

# Hard coded memory limits (ignoring BBB_PRESENTATION_CONVERSION_MEMORY_HIGH and BBB_PRESENTATION_CONVERSION_MEMORY_MAX)
ulimit -S -v $((512*1024))
ulimit -H -v $((640*1024))
timeout "$timeout_secs" "$@"

exit $?   # propagate the child’s exit status
