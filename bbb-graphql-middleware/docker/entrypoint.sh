#!/usr/bin/env bash
# Entrypoint of the bbb-graphql-middleware image. Nothing is configured at start: the image's
# /usr/share/bbb-graphql-middleware/config.yml already holds the container wiring (Dockerfile),
# and the binary merges the Tier 3 override /etc/bigbluebutton/bbb-graphql-middleware.yml over
# it itself (config/Config.go), as on bare metal. No configuration contract variable applies.
set -euo pipefail          # never set -x: xtrace prints every value, secrets included
# shellcheck source=docker/lib/entrypoint-lib.sh
source /usr/local/lib/bbb/entrypoint-lib.sh
BBB_LOG_TAG=graphql-middleware

bbb_init "$@"
set -- "${BBB_ARGS[@]}"
[ "$#" -gt 0 ] || set -- bbb-graphql-middleware

# 3. render: --render-only writes the config.yml the binary reads, at its own path
config=/usr/share/bbb-graphql-middleware/config.yml
if bbb_is_render_only; then
    dest="$(bbb_path "$config")"
    mkdir -p "$(dirname "$dest")"
    cp "$config" "$dest"
fi

# Wait for redis, as the unit starts the middleware after redis-server
# (After=, build/packages-template/bbb-graphql-middleware/bbb-graphql-middleware.service).
# Without redis at start the binary panics (nil pointer dereference) and only the restart
# policy recovers it, in a loop; `docker compose restart` restarts all services at once
# (seen with Docker Engine 29.9.1). redis as configured: redis.host/redis.port of the image's
# config.yml, replaced by the Tier 3 file's if it sets them (the binary merges it the same way).
# Not in render-only mode. If redis does not answer within the limit, exit: the restart policy
# starts the container again.
OVERRIDE=/etc/bigbluebutton/bbb-graphql-middleware.yml
REDIS_WAIT_SECONDS=60

# Prints redis.host and redis.port of a YAML file as "HOST|PORT" (each empty if unset), block
# style as shipped: "redis:" at the top level, then indented "host:" and "port:" keys. A
# flow-style redis value ("redis: {...}") prints "flow", as it cannot be read here.
redis_address() {
    awk '
        function val(line) {
            sub(/^[^:]*:[ \t]*/, "", line); sub(/[ \t]+#.*$/, "", line)
            gsub(/^["\047]|["\047][ \t]*$/, "", line); return line
        }
        /^redis:[ \t]*[{]/ { flow = 1; next }
        /^redis:[ \t]*(#.*)?$/ { in_redis = 1; next }
        /^[^ \t#]/ { in_redis = 0 }
        in_redis && /^[ \t]+host:/ { host = val($0) }
        in_redis && /^[ \t]+port:/ { port = val($0) }
        END { if (flow) print "flow"; else print host "|" port }
    ' "$1"
}

if ! bbb_is_render_only && [ "$(basename -- "$1")" = bbb-graphql-middleware ]; then
    IFS="|" read -r redis_host redis_port <<<"$(redis_address "$config")"
    wait_for_redis=1
    if [ -f "$OVERRIDE" ] && [ -r "$OVERRIDE" ]; then
        IFS="|" read -r host port <<<"$(redis_address "$OVERRIDE")"
        if [ "$host" = flow ]; then
            wait_for_redis=
            bbb_log "$OVERRIDE sets redis in flow style; not waiting for redis"
        fi
        redis_host="${host:-$redis_host}"
        redis_port="${port:-$redis_port}"
    fi
    if [ -n "$wait_for_redis" ]; then
        [ -n "$redis_host" ] && [ -n "$redis_port" ] \
            || bbb_die "cannot read redis.host/redis.port from $config"
        # bash as PID 1 ignores SIGTERM without a handler; stop waiting when the container stops.
        trap 'exit 143' TERM
        deadline=$((SECONDS + REDIS_WAIT_SECONDS))
        # The braces also silence bash's "Terminated" notice when busybox timeout kills the probe.
        # shellcheck disable=SC2016  # expanded by the inner bash
        until { timeout 2 bash -c 'exec 3<>"/dev/tcp/$1/$2"' _ "$redis_host" "$redis_port"; } 2>/dev/null; do
            [ "$SECONDS" -lt "$deadline" ] \
                || bbb_die "redis ($redis_host:$redis_port) not reachable after ${REDIS_WAIT_SECONDS}s"
            [ -n "${waiting:-}" ] || { bbb_log "waiting for redis ($redis_host:$redis_port)"; waiting=1; }
            sleep 1
        done
        trap - TERM
    fi
fi

# 5. exec
bbb_exec "$@"
