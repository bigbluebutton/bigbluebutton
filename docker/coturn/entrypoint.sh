#!/usr/bin/env bash
set -euo pipefail
# shellcheck source=docker/lib/entrypoint-lib.sh
source /usr/local/lib/bbb/entrypoint-lib.sh

BBB_LOG_TAG=coturn
bbb_init "$@"
set -- "${BBB_ARGS[@]}"
# Arguments starting with "-" are passed through to turnserver as extra options, as with the
# coturn image (e.g. `command: ["--no-udp"]`). They are visible in `ps`: never put secrets there.
if [ "$#" -eq 0 ] || [ "${1:0:1}" = "-" ]; then
    set -- turnserver -c /etc/turnserver.conf --pidfile= --log-file=stdout "$@"
fi

# Tier 3: a file mounted at /etc/turnserver.conf replaces the configuration as a whole and is
# used as is (bare metal: admins edit the file bbb-install writes). /etc/turnserver.conf is a
# link into /run/turnserver, so engines that follow it mount the file there instead.
if [ "$(readlink -- /etc/turnserver.conf || true)" != /run/turnserver/turnserver.conf ] \
    || awk '$5 == "/etc/turnserver.conf" || $5 == "/run/turnserver/turnserver.conf" { found = 1 } END { exit !found }' /proc/self/mountinfo; then
    bbb_log "WARNING: using the file mounted at /etc/turnserver.conf as is; BBB_DOMAIN, TURN_SECRET, TURN_RELAY_PORT_MIN/MAX and BBB_LIVEKIT_IP are not applied"
    if bbb_is_render_only; then
        bbb_log "render-only: nothing written below $BBB_RENDER_ROOT (the mounted file is used as is); process not started"
        exit 0
    fi
    bbb_exec "$@"
fi

# 1. validate
bbb_require BBB_DOMAIN
bbb_require_match BBB_DOMAIN '([A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?'
bbb_require_secret TURN_SECRET
bbb_require_match TURN_SECRET '[A-Za-z0-9+/=]{32,}'
bbb_default TURN_RELAY_PORT_MIN 49160
bbb_default TURN_RELAY_PORT_MAX 49199
bbb_require_match TURN_RELAY_PORT_MIN '[1-9][0-9]{0,4}'
bbb_require_match TURN_RELAY_PORT_MAX '[1-9][0-9]{0,4}'
if [ "$TURN_RELAY_PORT_MAX" -gt 65535 ]; then
    bbb_die "TURN_RELAY_PORT_MAX must be at most 65535"
fi
if [ "$TURN_RELAY_PORT_MIN" -gt "$TURN_RELAY_PORT_MAX" ]; then
    bbb_die "TURN_RELAY_PORT_MIN must not be greater than TURN_RELAY_PORT_MAX"
fi
bbb_default BBB_LIVEKIT_IP 172.30.82.20
bbb_require_match BBB_LIVEKIT_IP '((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])'

# 3. render into /run/turnserver, the only writable path; render-only mode writes a plain file
# at the bare-metal path.
dest="$(bbb_path /etc/turnserver.conf)"
bbb_is_render_only || dest=/run/turnserver/turnserver.conf
bbb_render --mode 0600 /usr/local/share/bbb/templates/turnserver.conf "$dest"

# 5. exec
bbb_exec "$@"
