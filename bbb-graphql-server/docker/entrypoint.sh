#!/usr/bin/env bash
# graphql-server: Hasura as the bbb-graphql-server package runs it
# (build/packages-template/bbb-graphql-server).
#
# Bare metal: the unit bbb-graphql-server@8085 starts `hasura-graphql-engine serve` with the
# env file /etc/default/bbb-graphql-server and the admin secret, and after-install.sh writes
# the admin secret into the CLI's config.yaml and runs `hasura metadata apply` once the
# engine listens. This entrypoint does the same at every start:
#   1. validate the contract secrets
#   3. render /etc/default/bbb-graphql-server, config.yaml (admin_secret) and the
#      BigBlueButton source DSN in metadata/databases/databases.yaml (no from_env upstream)
#   -  load the env file, as systemd's EnvironmentFile (the container environment wins)
#   -  apply the metadata through a temporary engine on loopback, retried until postgres is
#      up and db-init has created the databases and role passwords
#   5. exec the engine
set -euo pipefail          # never set -x: xtrace prints every value, secrets included
# shellcheck source=docker/lib/entrypoint-lib.sh
source /usr/local/lib/bbb/entrypoint-lib.sh
BBB_LOG_TAG=graphql-server

bbb_init "$@"
set -- "${BBB_ARGS[@]}"
[ "$#" -gt 0 ] || set -- /usr/bin/hasura-graphql-engine serve

SHARE=/usr/share/bbb-graphql-server
PACKAGED=/usr/local/share/bbb/graphql-server
RUN_DIR=/run/bbb-graphql-server
# The temporary engine for `metadata apply` listens on loopback only, on a port of its own,
# so the healthcheck (port 8085) turns healthy only for the engine started at the end.
APPLY_PORT=9691
APPLY_WAIT_SECONDS=180

# 1. validate. Upstream placeholders: the CLI's admin_secret (config.yaml) and the fixed role
# passwords (after-install.sh). The format first: bbb_require_secret's message contains the
# word "secret", which is itself a placeholder value.
SECRETS=(HASURA_ADMIN_SECRET POSTGRES_HASURA_APP_PASSWORD POSTGRES_BBB_HASURA_PASSWORD)
for name in "${SECRETS[@]}"; do
    bbb_require_match "$name" '[A-Za-z0-9]{32,}'
done
BBB_SECRET_PLACEHOLDERS+=(bigbluebutton hasura_app bbb_hasura)
bbb_require_secret "${SECRETS[@]}"

if [ -e /etc/bigbluebutton/bbb-graphql-server.env ]; then
    bbb_log "/etc/bigbluebutton/bbb-graphql-server.env is not read in containers; set HASURA_GRAPHQL_* in the service environment instead"
fi

# 3. render. Each file's bare-metal path links into $RUN_DIR, the only writable path; in
# render-only mode a plain file is written at the bare-metal path.
# output BARE-METAL-PATH NAME-IN-RUN-DIR: prints the path to write.
output() {
    if bbb_is_render_only; then
        bbb_path "$1"
        return
    fi
    if [ "$(readlink -- "$1" || true)" != "$RUN_DIR/$2" ] \
        || awk -v a="$1" -v b="$RUN_DIR/$2" '$5 == a || $5 == b { found = 1 } END { exit !found }' /proc/self/mountinfo; then
        bbb_die "a file is mounted at $1; replacing it is not supported"
    fi
    printf '%s\n' "$RUN_DIR/$2"
}

dest="$(output /etc/default/bbb-graphql-server bbb-graphql-server.env)"
bbb_render --mode 0600 /usr/local/share/bbb/templates/bbb-graphql-server.env "$dest"
env_file="$dest"

# config.yaml: admin_secret for the CLI (after-install.sh writes it with sed).
dest="$(output "$SHARE/config.yaml" config.yaml)"
bbb_render --mode 0600 "$PACKAGED/config.yaml" "$dest"
yq -i '.admin_secret = strenv(HASURA_ADMIN_SECRET)' "$dest"

# databases.yaml: the BigBlueButton source's DSN is a literal; upstream's has the fixed
# password and 127.0.0.1.
dest="$(output "$SHARE/metadata/databases/databases.yaml" databases.yaml)"
bbb_render --mode 0600 "$PACKAGED/databases.yaml" "$dest"
BBB_GRAPHQL_DATABASE_URL="postgres://bbb_hasura:${POSTGRES_BBB_HASURA_PASSWORD}@postgres:5432/bbb_graphql" \
    yq -i '(.[] | select(.name == "BigBlueButton") | .configuration.connection_info.database_url) = strenv(BBB_GRAPHQL_DATABASE_URL)' "$dest"

if bbb_is_render_only; then
    bbb_exec "$@"
fi

# Environment of the engine, as the unit sets it: the env file (EnvironmentFile; NAME=value
# lines, the value taken literally) and the admin secret. A variable already set in the
# container environment is kept, so admins override Hasura settings there (the override file
# of bare metal is not supported, see above).
while IFS= read -r line || [ -n "$line" ]; do
    [[ "$line" =~ ^([A-Za-z_][A-Za-z0-9_]*)=(.*)$ ]] || continue
    [ -n "${!BASH_REMATCH[1]+set}" ] || export "${BASH_REMATCH[1]}=${BASH_REMATCH[2]}"
done < "$env_file"
export HASURA_GRAPHQL_ADMIN_SECRET="$HASURA_ADMIN_SECRET"

# redact TEXT: TEXT without the secret values.
redact() {
    local text="$1" name
    for name in "${SECRETS[@]}"; do
        text="${text//"${!name}"/***}"
    done
    printf '%s\n' "$text"
}

# Metadata apply (after-install.sh), only before the engine itself starts.
if [ "$(basename -- "$1")" = hasura-graphql-engine ] && [ "${2:-}" = serve ]; then
    apply_pid=""
    apply_log="$(mktemp)"
    stop_apply_engine() {
        if [ -n "$apply_pid" ]; then
            kill -TERM "$apply_pid" 2>/dev/null || true
            wait "$apply_pid" 2>/dev/null || true
            apply_pid=""
        fi
        rm -f -- "$apply_log"
    }
    trap stop_apply_engine EXIT
    trap 'exit 143' TERM INT

    # apply_metadata: 0 once the metadata is applied and consistent (every source reachable,
    # every tracked table present).
    apply_metadata() {
        local out
        curl -fsS -o /dev/null "http://127.0.0.1:$APPLY_PORT/healthz" 2>/dev/null || return 1
        if ! out="$(cd "$SHARE" && timeout 15s /usr/bin/hasura metadata apply --skip-update-check \
            --endpoint "http://127.0.0.1:$APPLY_PORT" 2>&1)"; then
            bbb_log "metadata apply failed: $(redact "$out")"
            return 1
        fi
        if ! out="$(cd "$SHARE" && timeout 15s /usr/bin/hasura metadata inconsistency status \
            --skip-update-check --endpoint "http://127.0.0.1:$APPLY_PORT" 2>&1)"; then
            bbb_log "metadata is inconsistent (postgres or db-init not ready?): $(redact "$out")"
            return 1
        fi
    }

    bbb_log "applying the metadata (waiting up to ${APPLY_WAIT_SECONDS}s for postgres and db-init)"
    deadline=$((SECONDS + APPLY_WAIT_SECONDS))
    until apply_metadata; do
        [ "$SECONDS" -lt "$deadline" ] || bbb_die "metadata not applied after ${APPLY_WAIT_SECONDS}s"
        if [ -n "$apply_pid" ] && ! kill -0 "$apply_pid" 2>/dev/null; then
            status=0
            wait "$apply_pid" || status=$?
            bbb_log "temporary engine exited with status $status: $(redact "$(tail -n 1 -- "$apply_log")")"
            apply_pid=""
        fi
        if [ -z "$apply_pid" ]; then
            HASURA_GRAPHQL_SERVER_HOST=127.0.0.1 HASURA_GRAPHQL_SERVER_PORT="$APPLY_PORT" \
                "$1" serve >"$apply_log" 2>&1 &
            # shellcheck disable=SC2031  # $! of the job just started in this shell
            apply_pid=$!
        fi
        # wait, unlike sleep, returns as soon as TERM arrives
        sleep 2 &
        # shellcheck disable=SC2031  # as above
        wait $! || true
    done
    stop_apply_engine
    trap - EXIT TERM INT
    bbb_log "metadata applied"
fi

# The engine reads only HASURA_GRAPHQL_*; the contract variables stay out of its environment.
unset "${SECRETS[@]}"

# 5. exec
bbb_exec "$@"
