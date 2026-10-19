#!/usr/bin/env bash
# Entrypoint of the bbb-shared-notes-server image. The server reads no environment: its config
# loader (src/config/index.ts) reads /usr/share/bbb-shared-notes-server/config/default.yml and
# deep-merges the Tier 3 override /etc/bigbluebutton/bbb-shared-notes-server.yml over it. This
# entrypoint writes default.yml from the packaged file with the container wiring and the role
# password set; the override path stays the admin's, and the server merges it itself.
set -euo pipefail          # never set -x: xtrace prints every value, secrets included
# shellcheck source=docker/lib/entrypoint-lib.sh
source /usr/local/lib/bbb/entrypoint-lib.sh
BBB_LOG_TAG=shared-notes

bbb_init "$@"
set -- "${BBB_ARGS[@]}"
[ "$#" -gt 0 ] || set -- node bbb-shared-notes-server.js

# 1. validate. Format first: its message never contains the value. The packaged password
# (blocknote_app, after-install.sh) is a placeholder here.
bbb_require_match POSTGRES_BLOCKNOTE_PASSWORD '[A-Za-z0-9]{32,}'
BBB_SECRET_PLACEHOLDERS+=(blocknote_app)
bbb_require_secret POSTGRES_BLOCKNOTE_PASSWORD

# 2. derive: nothing. Hostnames are the compose service names on the notes network.

# 3. render: the packaged default.yml with wiring and password set by yq. yq drops blank
# lines, so they pass through it as a marker comment and the file keeps upstream's layout.
# The file holds the password, so it is readable only by the service's own UID.
dest="$(bbb_path /usr/share/bbb-shared-notes-server/config/default.yml)"
mkdir -p "$(dirname "$dest")"
export POSTGRES_BLOCKNOTE_PASSWORD
( umask 077
  sed 's/^$/#bbb-blank-line/' /usr/local/share/bbb-shared-notes-server/default.yml \
    | yq '
        .expressServer.host = "0.0.0.0" |
        .bbbWeb.host = "bbb-web" |
        .redis.host = "redis" |
        .postgres.host = "postgres" |
        .postgres.password = strenv(POSTGRES_BLOCKNOTE_PASSWORD)
      ' \
    | sed 's/^#bbb-blank-line$//' >"$dest" )
chmod 0600 "$dest"

# 4. merge: none here. The server merges /etc/bigbluebutton/bbb-shared-notes-server.yml at
# start, as on bare metal.

# Wait for redis. The server connects its redis publisher once, when it starts
# (src/redis/publisher.ts): started while redis is down, it keeps running without a publisher
# (its subscriber reconnects), so shared notes are never created for new meetings.
# `docker compose restart` restarts all services at once. redis as the server reads it:
# redis.host/redis.port of default.yml, replaced by the Tier 3 file's if it sets them. Not in
# render-only mode. If redis does not answer within the limit, exit: the restart policy starts
# the container again.
OVERRIDE=/etc/bigbluebutton/bbb-shared-notes-server.yml
REDIS_WAIT_SECONDS=60
if ! bbb_is_render_only && [ "${2:-}" = bbb-shared-notes-server.js ]; then
    files=("$dest")
    [ ! -r "$OVERRIDE" ] || files+=("$OVERRIDE")
    # shellcheck disable=SC2016  # a yq expression, not a shell expansion
    IFS="|" read -r redis_host redis_port <<<"$(yq ea '. as $f ireduce ({}; . * $f)
        | (.redis.host // "") + "|" + ((.redis.port // "") | tostring)' "${files[@]}")"
    [ -n "$redis_host" ] && [ -n "$redis_port" ] || bbb_die "cannot read redis.host/redis.port"
    deadline=$((SECONDS + REDIS_WAIT_SECONDS))
    # shellcheck disable=SC2016  # expanded by the inner bash
    until { timeout 2 bash -c 'exec 3<>"/dev/tcp/$1/$2"' _ "$redis_host" "$redis_port"; } 2>/dev/null; do
        [ "$SECONDS" -lt "$deadline" ] \
            || bbb_die "redis ($redis_host:$redis_port) not reachable after ${REDIS_WAIT_SECONDS}s"
        [ -n "${waiting:-}" ] || { bbb_log "waiting for redis ($redis_host:$redis_port)"; waiting=1; }
        sleep 1
    done
fi

# 5. exec
bbb_exec "$@"
