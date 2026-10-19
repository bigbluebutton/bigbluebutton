#!/usr/bin/env bash
# run-in-systemd.sh — container replacement for bigbluebutton-web/run-in-systemd.sh.
#
# Usage:  run-in-systemd.sh <timeout-seconds> <command> [args …]
#
# bbb-common-web runs the presentation conversion tools through this path (hard-coded in
# ImageResizerImp, PdfPageCounter, ImageResolutionService, SvgImageCreatorImp, PngCreatorImp),
# so the image keeps the path and the argument contract. On bare metal the script starts a
# hardened transient unit of the bigbluebutton user's systemd instance. A container has no
# systemd user manager; it is the sandbox itself (own root filesystem, non-root user, the
# memory limit of the service). What does not need systemd is kept:
#
#   RuntimeMaxSec=<timeout>  timeout(1); SIGKILL if the command ignores SIGTERM
#   MemoryMax=640M           hard address-space limit (ulimit -v) at the same default
#   UMask=0022               umask 0022
#   --same-dir               the command runs in the caller's working directory
#
# MemoryHigh (a soft limit) has no equivalent without cgroups. ProtectSystem, ProtectHome,
# PrivateTmp, NoNewPrivileges and the mount syscall filter are covered by the container: the
# image is root-owned, the service runs without privileges, and only /tmp and the data
# volume (/var/bigbluebutton) are writable.

set -euo pipefail

if [[ $# -lt 2 ]]; then
  echo "Usage: $0 <timeout-seconds> <command> [args …]" >&2
  exit 1
fi

timeout_secs="$1"; shift

# Upstream's default MemoryMax (640M), in KiB.
ulimit -v $((640 * 1024))
umask 0022

exec timeout --kill-after=10s "${timeout_secs}" "$@"
