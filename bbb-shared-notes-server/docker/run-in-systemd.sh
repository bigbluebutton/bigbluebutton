#!/usr/bin/env bash
# run-in-systemd.sh — container replacement for bbb-shared-notes-server/run-in-systemd.sh.
#
# Usage:  run-in-systemd.sh <timeout-seconds> <command> [args …]
#
# The PDF export runs wkhtmltopdf through the script named in commandExecution.runnerScript of
# config/default.yml (src/express/handlers/exportDocumentToPdf.ts), so the image keeps the
# path and the argument contract. On bare metal the script starts a hardened transient unit of
# the bigbluebutton user's systemd instance. A container has no systemd user manager; it is
# the sandbox itself (own root filesystem, non-root user, the memory limit of the service).
# What does not need systemd is kept:
#
#   RuntimeMaxSec=<timeout>     timeout(1); SIGKILL if the command ignores SIGTERM
#   WorkingDirectory=           the command runs in BBB_BLOCKNOTE_DIR (same default)
#   UMask=0022                  umask 0022
#   PrivateNetwork=true,        no-network(1) of this image (docker/no-network.c): the command
#   IPAddressDeny=any           and everything it starts cannot create sockets, so it reaches no
#                               address, loopback included. It needs no privileges; if it cannot
#                               set up the restriction, the command does not run.
#   ReadWritePaths=, NoNewPrivileges=true
#                               no-network --write BBB_BLOCKNOTE_DIR: where the kernel offers
#                               Landlock, the command writes only there (and /dev/null) and cannot
#                               trace or open the memory of processes outside its own; it runs
#                               with no_new_privs
#
# MemoryHigh/MemoryMax need cgroups; the memory limit of the service applies instead (an
# address-space limit, ulimit -v, makes wkhtmltopdf's WebKit crash at start). ProtectSystem,
# ProtectHome and the mount syscall filter are covered by the container: the image is
# root-owned, the service runs without privileges, and only /tmp and the rendered config are
# writable.
#
#   PrivateTmp=true             a directory of its own per run below BBB_BLOCKNOTE_DIR (mode
#                               0700), removed afterwards: TMPDIR, XDG_RUNTIME_DIR and
#                               XDG_CACHE_HOME of the command

set -euo pipefail

if [[ $# -lt 2 ]]; then
  echo "Usage: $0 <timeout-seconds> <command> [args …]" >&2
  exit 1
fi

timeout_secs="$1"; shift

: "${BBB_BLOCKNOTE_DIR:=/tmp/shared-notes-dropbox/}"

cd "$BBB_BLOCKNOTE_DIR"
umask 0022

run_tmp="$(mktemp -d "${BBB_BLOCKNOTE_DIR%/}/.run-XXXXXXXX")"
trap 'rm -rf -- "$run_tmp"' EXIT
trap 'exit 143' TERM HUP
trap 'exit 130' INT
mkdir "$run_tmp/tmp" "$run_tmp/runtime" "$run_tmp/cache"
chmod 0700 "$run_tmp/runtime"

status=0
TMPDIR="$run_tmp/tmp" XDG_RUNTIME_DIR="$run_tmp/runtime" XDG_CACHE_HOME="$run_tmp/cache" \
  no-network --write "$BBB_BLOCKNOTE_DIR" timeout --kill-after=10s "${timeout_secs}" "$@" || status=$?
exit "$status"
