#!/usr/bin/env bash
# Healthcheck of the recording services: the process of the role is running and, for the
# processes that use redis, redis (redis_host and redis_port of bigbluebutton.yml) accepts
# connections.
#
# Usage: recording-healthcheck.sh [ROLE]
#   ROLE   default: the role the container was started with, the argument after
#          /entrypoint.sh in the command line of PID 1 (tini), else bbb-rap-resque-worker
set -euo pipefail

# started_role — the entrypoint's first argument, from PID 1's command line.
started_role() {
    local args=() i
    mapfile -d '' -t args </proc/1/cmdline 2>/dev/null || true
    for ((i = 0; i < ${#args[@]} - 1; i++)); do
        if [ "${args[i]}" = /entrypoint.sh ]; then printf '%s\n' "${args[i + 1]}"; return; fi
    done
}

role="${1:-$(started_role)}"
role="${role:-bbb-rap-resque-worker}"

# count_processes ERE — number of processes whose command line matches ERE.
count_processes() {
    local n=0 file cmdline
    for file in /proc/[0-9]*/cmdline; do
        cmdline="$(tr '\0' ' ' <"$file" 2>/dev/null)" || continue
        if [[ "$cmdline" =~ $1 ]]; then n=$((n + 1)); fi
    done
    echo "$n"
}

check_redis() {
    local yml=/usr/local/bigbluebutton/core/scripts/bigbluebutton.yml host port
    host="$(yq-go '.redis_host' "$yml")"
    port="$(yq-go '.redis_port' "$yml")"
    # shellcheck disable=SC2016 # expanded by the inner bash
    timeout 3 bash -c 'exec 3<>"/dev/tcp/$1/$2"' _ "$host" "$port" 2>/dev/null \
        || { echo "redis ($host:$port) is not reachable"; exit 1; }
}

case "$role" in
    bbb-rap-resque-worker)
        # Each worker sets its process title to "resque-<version>: ..." (a job's child too).
        want="${RECORDING_WORKERS:-1}"
        have="$(count_processes '^resque-[0-9.]+: ')"
        [ "$have" -ge "$want" ] || { echo "$have of $want resque workers running"; exit 1; }
        check_redis
        ;;
    bbb-rap-starter)
        [ "$(count_processes 'rap-starter\.rb')" -ge 1 ] || { echo "rap-starter.rb is not running"; exit 1; }
        check_redis
        ;;
    bbb-rap-caption-inbox)
        [ "$(count_processes 'rap-caption-inbox\.rb')" -ge 1 ] || { echo "rap-caption-inbox.rb is not running"; exit 1; }
        ;;
    bbb-recording-cleanup)
        [ "$(count_processes 'recording/cleanup\.sh')" -ge 1 ] || { echo "the cleanup loop is not running"; exit 1; }
        ;;
    *)
        echo "unknown role: $role"
        exit 1
        ;;
esac
