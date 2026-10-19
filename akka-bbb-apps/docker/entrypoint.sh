#!/usr/bin/env bash
# Entrypoint of the akka-apps image. akka-apps reads its configuration with Typesafe Config
# (HOCON), which takes values from the environment natively: the image's application.conf
# (upstream's, with the container wiring of docker/application.conf.patch) references
# ${BBB_DOMAIN}, ${?BBB_SHARED_SECRET} and ${?POSTGRES_BBB_CORE_PASSWORD}. So this script only
# validates them and chooses the configuration file; nothing with a secret is written.
#
# Configuration file (-Dconfig.file), as on bare metal:
#   /etc/bigbluebutton/bbb-apps-akka.conf               if mounted (Tier 3; it starts with
#       include "/usr/share/bbb-apps-akka/conf/application.conf", then later keys win)
#   /usr/share/bbb-apps-akka/conf/application.conf      otherwise
#
# --render-only DIR writes no configuration (there is nothing to render); it copies the image's
# application.conf to DIR at its bare-metal path, so that the golden and parity tests cover it.
set -euo pipefail          # never set -x: xtrace prints every value, secrets included
# shellcheck source=docker/lib/entrypoint-lib.sh
source /usr/local/lib/bbb/entrypoint-lib.sh
BBB_LOG_TAG=akka-apps

APP_HOME=/usr/share/bbb-apps-akka
APP_CONF="$APP_HOME/conf/application.conf"
OVERRIDE=/etc/bigbluebutton/bbb-apps-akka.conf
REDIS_WAIT_SECONDS=60

bbb_init "$@"
set -- "${BBB_ARGS[@]}"

# 1. validate. The patterns are the contract's; they also reject upstream's defaults
# (sharedSecret "changeme", the bbb_core role password "bbb_core").
bbb_require_match BBB_DOMAIN '([A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?'
bbb_require_match BBB_SHARED_SECRET '[A-Za-z0-9]{32,}'
bbb_require_secret BBB_SHARED_SECRET
# Optional in the contract, but without it HOCON would keep upstream's fixed password.
bbb_require_match POSTGRES_BBB_CORE_PASSWORD '[A-Za-z0-9]{32,}'
# 2. derive: nothing; HOCON reads the three variables from the environment.
export BBB_DOMAIN BBB_SHARED_SECRET POSTGRES_BBB_CORE_PASSWORD

# 3. render: nothing; see the header.
if bbb_is_render_only; then
    dest="$(bbb_path "$APP_CONF")"
    mkdir -p "$(dirname "$dest")"
    cp "$APP_CONF" "$dest"
fi

# 4. merge: the Tier 3 file replaces application.conf as the file the JVM loads.
config_file="$APP_CONF"
if [ -e "$OVERRIDE" ] || [ -L "$OVERRIDE" ]; then
    [ -f "$OVERRIDE" ] || bbb_die "$OVERRIDE is not a regular file"
    [ -r "$OVERRIDE" ] || bbb_die "$OVERRIDE is not readable"
    config_file="$OVERRIDE"
    bbb_log "using $OVERRIDE"
fi

# Default command: upstream's start script (build.sbt: JavaServerAppPackaging), started from
# its directory like the systemd unit (WorkingDirectory), as logback.xml is a relative path.
# A -Dconfig.file argument comes after the packaged one (conf/application.ini), so it wins.
[ "$#" -gt 0 ] || set -- "$APP_HOME/bin/bbb-apps-akka" "-Dconfig.file=$config_file"
cd "$APP_HOME"

# Wait for redis, as the unit starts akka-apps after redis-server (After=, start-template).
# akka-apps connects to redis once, in its main thread (Boot.scala, RedisPublisher); if redis
# is not there, that thread dies but the actor system keeps the JVM running, without the
# HTTP API and without exiting, so no restart policy helps. `docker compose restart` restarts
# all services at once (seen with Docker Engine 29.9.1). Not in render-only mode. If redis does
# not answer within the limit, exit: the restart policy starts the container again.
#
# The address is the one akka-apps will use: RedisAddress (Dockerfile) loads the same
# configuration file with the same Typesafe Config call and the image's classpath, so a
# Tier 3 file's includes, substitutions and object forms all count, and nothing is parsed
# here. If the configuration cannot be loaded, akka-apps fails on it itself with the full
# message; then there is no address to wait for.
if ! bbb_is_render_only && [ "$(basename -- "$1")" = bbb-apps-akka ]; then
    if address="$(java -Xshare:auto -XX:TieredStopAtLevel=1 -Xmx64m \
            -cp "/usr/local/lib/bbb/akka-apps:$APP_HOME/lib/*" \
            -Dconfig.file="$config_file" RedisAddress 2>/dev/null)" \
        && read -r redis_host redis_port <<<"$address" && [ -n "$redis_host" ] \
        && [[ "$redis_port" =~ ^[0-9]+$ ]]; then
        # bash as PID 1 ignores SIGTERM without a handler; stop waiting when the container stops.
        trap 'exit 143' TERM
        deadline=$((SECONDS + REDIS_WAIT_SECONDS))
        # shellcheck disable=SC2016  # expanded by the inner bash
        until timeout 2 bash -c 'exec 3<>"/dev/tcp/$1/$2"' _ "$redis_host" "$redis_port" 2>/dev/null; do
            [ "$SECONDS" -lt "$deadline" ] \
                || bbb_die "redis ($redis_host:$redis_port) not reachable after ${REDIS_WAIT_SECONDS}s"
            [ -n "${waiting:-}" ] || { bbb_log "waiting for redis ($redis_host:$redis_port)"; waiting=1; }
            sleep 1
        done
        trap - TERM
    else
        bbb_log "WARNING: cannot read redis.host/redis.port from $config_file; not waiting for redis"
    fi
fi

# 5. exec
bbb_exec "$@"
