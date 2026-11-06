#!/bin/sh
# Stands in for bbb-web's run-in-systemd.sh, which runs each converter in a
# transient systemd unit (RuntimeMaxSec, MemoryMax=640M, PrivateTmp, a
# system call filter). A container has no systemd user session, so this
# applies the time limit only, and like systemd, kills what ignores SIGTERM.
set -eu
if [ "$#" -lt 2 ]; then
	echo "Usage: $0 <timeout-seconds> <command> [args ...]" >&2
	exit 1
fi
timeout_secs=$1
shift
umask 0022
exec timeout --kill-after=10s "$timeout_secs" "$@"
