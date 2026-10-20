#!/bin/sh
# Replaces ../run-in-systemd.sh: containers have no systemd user session, so the command
# only gets the timeout. Usage: run-in-systemd.sh <timeout-seconds> <command> [args ...]
timeout_secs="$1"; shift
exec timeout "$timeout_secs" "$@"
