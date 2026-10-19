#!/usr/bin/env bash
# bbb-web entrypoint (docker/lib/README.md: validate, derive, render, merge, exec).
#
# bbb-web reads classpath:bigbluebutton.properties, then /etc/bigbluebutton/bbb-web.properties
# if readable (grails-app/conf/application.groovy). Environment variables do not override
# properties keys, but `${VAR}` references inside the file resolve from the environment, and
# unset references stay literal. So the image writes upstream's classpath file with
# references for the secrets (`securitySalt=${BBB_SHARED_SECRET}`) after validating them, and
# /etc/bigbluebutton/bbb-web.properties stays free for the admin (Tier 3).
set -euo pipefail          # never set -x: xtrace prints every value, secrets included
# shellcheck source=docker/lib/entrypoint-lib.sh
source /usr/local/lib/bbb/entrypoint-lib.sh

BBB_LOG_TAG=bbb-web
bbb_init "$@"
set -- "${BBB_ARGS[@]}"

# Upstream files as shipped, kept outside the classpath (the Dockerfile moves them there).
DEFAULTS=/usr/local/share/bbb/bbb-web
CLASSES=/usr/share/bbb-web/WEB-INF/classes
# The rendered classpath files are links into this directory, the only writable path besides
# /tmp and the data volume (docker/README.md, "Running under an arbitrary UID/GID").
RUNTIME_DIR=/run/bbb-web

# SHA-256 of upstream's public default securitySalt (bigbluebutton.properties). Compared as a
# hash so the literal is not in the repository.
UPSTREAM_SALT_SHA256=f85c8c2934b5a89cea99f26c887ecef1216d900e8652bba4ac9a7982d68ec96a

# reject_upstream_salt NAME... — fail if a variable holds upstream's default securitySalt.
reject_upstream_salt() {
    local name hash
    for name in "$@"; do
        hash="$(printf '%s' "${!name}" | sha256sum)"
        if [ "${hash%% *}" = "$UPSTREAM_SALT_SHA256" ]; then
            bbb_die "$name is set to upstream's public default securitySalt; set a generated secret"
        fi
    done
}

# write_file DEST MODE COMMAND [ARGS...] — write the command's output to DEST atomically.
# For files that must keep literal ${VAR} references, which bbb_render would substitute.
write_file() {
    local dest="$1" mode="$2" dir tmp
    shift 2
    dir="$(dirname -- "$dest")"
    mkdir -p -- "$dir" || bbb_die "cannot create directory $dir"
    tmp="$(mktemp -- "$dir/.$(basename -- "$dest").XXXXXX")" || bbb_die "cannot create a temporary file in $dir"
    if ! "$@" >"$tmp" || ! chmod "$mode" -- "$tmp" || ! mv -f -- "$tmp" "$dest"; then
        rm -f -- "$tmp"
        bbb_die "cannot write $dest"
    fi
    bbb_log "rendered $dest"
}

# render_dest CLASSPATH_FILE — where to write a rendered classpath file: below the render-only
# directory at its bare-metal path, else the link target in RUNTIME_DIR.
render_dest() {
    local path="$CLASSES/$1"
    if bbb_is_render_only; then
        bbb_path "$path"
    elif [ "$(readlink -- "$path" || true)" = "$RUNTIME_DIR/$1" ]; then
        printf '%s\n' "$RUNTIME_DIR/$1"
    else
        bbb_die "$path is not the image's link to $RUNTIME_DIR/$1; use /etc/bigbluebutton for overrides"
    fi
}

# set_property KEY VALUE — queue a sed edit that replaces the line KEY=... of upstream's file.
# The key must be there exactly once, so a changed upstream file stops the start.
PROPERTY_EDITS=()
set_property() {
    local key="$1" value="$2" key_re count
    key_re="^${key//./\\.}="
    count="$(grep -c -- "$key_re" "$DEFAULTS/bigbluebutton.properties")" || true
    [ "$count" -eq 1 ] || bbb_die "expected one $key line in $DEFAULTS/bigbluebutton.properties, found $count"
    value="${value//\\/\\\\}"
    value="${value//|/\\|}"
    value="${value//&/\\&}"
    PROPERTY_EDITS+=(-e "s|${key_re}.*|${key}=${value}|")
}

# 1. validate (patterns: docker/config-contract.yaml)
bbb_require BBB_DOMAIN
bbb_require_match BBB_DOMAIN '([A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?'
# Format first: the placeholder message would quote a value such as "secret" verbatim.
bbb_require BBB_SHARED_SECRET TURN_SECRET
bbb_require_match BBB_SHARED_SECRET '[A-Za-z0-9]{32,}'
bbb_require_match TURN_SECRET '[A-Za-z0-9+/=]{32,}'
bbb_require_secret BBB_SHARED_SECRET TURN_SECRET
reject_upstream_salt BBB_SHARED_SECRET

# Unset or empty means no optional feature.
: "${BBB_FEATURES=}"
bbb_require_match BBB_FEATURES '((recording|greenlight|webhooks|monitoring|external-proxy)(,(recording|greenlight|webhooks|monitoring|external-proxy))*)?'

if [ -n "${BBB_WEB_PAGE_TOKEN_SECRET:-}" ]; then
    bbb_require_match BBB_WEB_PAGE_TOKEN_SECRET '[A-Za-z0-9]{32,}'
    bbb_require_secret BBB_WEB_PAGE_TOKEN_SECRET
    reject_upstream_salt BBB_WEB_PAGE_TOKEN_SECRET
fi

bbb_default BBB_WEB_MAX_HEAP_SIZE 384m
bbb_require_match BBB_WEB_MAX_HEAP_SIZE '[1-9][0-9]*[kKmMgG]'

if [ -n "${BBB_WEB_CONVERSION_URL:-}" ]; then
    bbb_require_match BBB_WEB_CONVERSION_URL 'https?://[A-Za-z0-9.-]+(:[0-9]{1,5})?(/[A-Za-z0-9._~/-]*)?'
    export BBB_WEB_CONVERSION_URL    # read by convert-remote.sh, a child of bbb-web
fi

# 2. derive
# Contract features: without `recording`, record=true in the API is ignored.
if bbb_feature_enabled recording; then disable_recording=false; else disable_recording=true; fi

# 3. render
# Classpath bigbluebutton.properties: upstream's file with the keys bare metal sets
# (after-install.sh, bbb-conf --setip) and the container wiring. The secrets stay references.
set_property bigbluebutton.web.serverURL "https://${BBB_DOMAIN}"
# shellcheck disable=SC2016 # literal reference, resolved by bbb-web from the environment
set_property securitySalt '${BBB_SHARED_SECRET}'
if [ -n "${BBB_WEB_PAGE_TOKEN_SECRET:-}" ]; then
    # shellcheck disable=SC2016 # literal reference, as above; unset keeps upstream's ${securitySalt}
    set_property pageTokenSecret '${BBB_WEB_PAGE_TOKEN_SECRET}'
fi
set_property disableRecordingDefault "$disable_recording"
set_property redisHost redis
# Inside the stack, BBB_DOMAIN resolves to the TLS edge's internal address (docker-compose.yml,
# haproxy alias), which the URL fetch checks reject as private unless the host is listed here;
# on bare metal the name resolves to the server's public address. Listing the server's own
# name keeps presentation, plugin and callback URLs on this server working as on bare metal.
set_property fetchUrlAllowedLocalHosts "${BBB_DOMAIN}"
# Office documents: without a conversion service, upstream's convert.sh path stays and is
# absent from the image, which is how bare metal runs after bbb-libreoffice's uninstall
# scripts: office uploads fail, PDF and image uploads convert as usual.
if [ -n "${BBB_WEB_CONVERSION_URL:-}" ]; then
    set_property presOfficeConversionExec "$DEFAULTS/convert-remote.sh"
fi
dest="$(render_dest bigbluebutton.properties)"
write_file "$dest" 0644 sed "${PROPERTY_EDITS[@]}" "$DEFAULTS/bigbluebutton.properties"

# TURN servers for clients, where bbb-install writes them for the local coturn. A readable
# /etc/bigbluebutton/turn-stun-servers.xml replaces this file (resources.groovy).
dest="$(render_dest spring/turn-stun-servers.xml)"
bbb_render --xml --mode 0640 "$DEFAULTS/turn-stun-servers.xml" "$dest"

# 4. merge: bbb-web reads the Tier 3 files itself.
for file in /etc/bigbluebutton/bbb-web.properties /etc/bigbluebutton/turn-stun-servers.xml; do
    if [ -r "$file" ]; then bbb_log "Tier 3 file $file is present; bbb-web reads it"; fi
done

# 5. exec, as the bbb-web unit does (bbb-web.service ExecStart, WorkingDirectory, Environment)
# with its EnvironmentFile /etc/default/bbb-web; the listen address must be reachable by nginx.
if [ "$#" -eq 0 ]; then
    set -a
    # shellcheck source=/dev/null
    . /etc/default/bbb-web
    set +a
    LISTEN_ADDRESS=0.0.0.0
    INITIAL_HEAP_SIZE="$BBB_WEB_MAX_HEAP_SIZE"
    MAX_HEAP_SIZE="$BBB_WEB_MAX_HEAP_SIZE"
    export MALLOC_ARENA_MAX=2
    cd /usr/share/bbb-web
    # JNA loads its native library from the image (Dockerfile) instead of unpacking it into
    # /tmp, which a container may mount noexec; jna.nounpack makes a missing library an error.
    set -- java -Dgrails.env="${ENV}" -Dserver.address="${LISTEN_ADDRESS}" -Dserver.port="${LISTEN_PORT}" \
        -Dspring.main.allow-circular-references=true -Xms"${INITIAL_HEAP_SIZE}" -Xmx"${MAX_HEAP_SIZE}" \
        -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath="${HEAP_DUMP_PATH}" \
        -Djna.boot.library.path=/usr/local/lib/bbb/bbb-web/jna -Djna.nounpack=true \
        -cp . org.springframework.boot.loader.launch.WarLauncher

    # Wait for redis, as the unit starts bbb-web after redis-server (After=, bbb-web.service).
    # Without redis at start, the application context fails ("Application run failed") but
    # the JVM keeps running, without the API and without exiting, so no restart policy helps.
    # `docker compose restart` restarts all services at once (seen with Docker Engine 29.9.1).
    # redis as configured: redisHost/redisPort of the Tier 3 file if it sets them, else the
    # image's.
    # If redis does not answer within the limit, exit: the restart policy starts it again.
    if ! bbb_is_render_only; then
        tier3=/etc/bigbluebutton/bbb-web.properties
        redis_host=redis
        redis_port=6379
        if [ -r "$tier3" ]; then
            # the last `key=value` (or `key: value`) line of the Tier 3 file, trimmed
            prop() { sed -n "s/^[[:space:]]*$1[[:space:]]*[=:][[:space:]]*\(.*[^[:space:]]\)[[:space:]]*\$/\1/p" "$tier3" | tail -n 1; }
            value="$(prop redisHost)"; redis_host="${value:-$redis_host}"
            value="$(prop redisPort)"; redis_port="${value:-$redis_port}"
        fi
        redis_wait_seconds=60
        # bash as PID 1 ignores SIGTERM without a handler; stop waiting when the container stops.
        trap 'exit 143' TERM
        deadline=$((SECONDS + redis_wait_seconds))
        # shellcheck disable=SC2016  # expanded by the inner bash
        until timeout 2 bash -c 'exec 3<>"/dev/tcp/$1/$2"' _ "$redis_host" "$redis_port" 2>/dev/null; do
            [ "$SECONDS" -lt "$deadline" ] \
                || bbb_die "redis ($redis_host:$redis_port) not reachable after ${redis_wait_seconds}s"
            [ -n "${waiting:-}" ] || { bbb_log "waiting for redis ($redis_host:$redis_port)"; waiting=1; }
            sleep 1
        done
        trap - TERM
    fi
fi

# bbb-web needs BBB_SHARED_SECRET (and BBB_WEB_PAGE_TOKEN_SECRET) from the environment; the
# TURN secret is in the rendered XML and not passed on to bbb-web and its conversion tools.
unset TURN_SECRET
bbb_exec "$@"
