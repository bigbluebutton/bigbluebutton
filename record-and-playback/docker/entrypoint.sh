#!/usr/bin/env bash
# Recording entrypoint (docker/lib/README.md: validate, derive, render, merge, exec).
#
# One image for every recording service. The first argument names the process, as the systemd
# units of bbb-record-core start it:
#   bbb-rap-resque-worker    the resque workers (archive, sanity, captions, process, publish,
#                            events), RECORDING_WORKERS of them (the unit's COUNT); the default
#   bbb-rap-starter          rap-starter.rb, which queues the recordings that bbb-web marks done
#   bbb-rap-caption-inbox    rap-caption-inbox.rb, which picks up uploaded captions
#   bbb-recording-cleanup    bbb-config's daily cleanup (/etc/cron.daily/bigbluebutton), once
#                            a day
# Any other command runs as given (for example `bbb-record --list`).
#
# Rendered for every process, at the bare-metal paths (links into /run/bbb-recording):
# - /usr/local/bigbluebutton/core/scripts/bigbluebutton.yml: upstream's file with the host
#   name set as the package scripts set it, and redis and the shared notes server as services.
# - /etc/bigbluebutton/bbb-web.properties: the server URL and the shared secret, which the
#   callbacks of the workers read from it, as bbb-conf writes it on bare metal.
# - /etc/default/bigbluebutton-cron-config and /etc/cron.daily/bigbluebutton: the cleanup's
#   settings (RECORDING_RAW_RETENTION_DAYS) and script.
# Tier 3: /etc/bigbluebutton/recording/recording.yml and /etc/bigbluebutton/recording/presentation.yml
# are read by the recording scripts themselves, as on bare metal.
set -euo pipefail          # never set -x: xtrace prints every value, secrets included
# shellcheck source=docker/lib/entrypoint-lib.sh
source /usr/local/lib/bbb/entrypoint-lib.sh

BBB_LOG_TAG=recording
bbb_init "$@"
set -- "${BBB_ARGS[@]}"
[ "$#" -gt 0 ] || set -- bbb-rap-resque-worker

# Upstream files as shipped, kept outside their bare-metal paths (the Dockerfile moves them).
DEFAULTS=/usr/local/share/bbb/recording
CORE=/usr/local/bigbluebutton/core
# The rendered files are links into this directory, writable for any UID (docker/README.md,
# "Running under an arbitrary UID/GID").
RUNTIME_DIR=/run/bbb-recording

# SHA-256 of upstream's public default securitySalt (bigbluebutton.properties), as in the
# bbb-web image. Compared as a hash so the literal is not in the repository.
UPSTREAM_SALT_SHA256=f85c8c2934b5a89cea99f26c887ecef1216d900e8652bba4ac9a7982d68ec96a

# render_dest PATH LINK_NAME — where to write the file of bare-metal PATH: below the render-only
# directory at PATH, else the link target in RUNTIME_DIR.
render_dest() {
    local path="$1" target="$RUNTIME_DIR/$2"
    if bbb_is_render_only; then
        bbb_path "$path"
    elif [ "$(readlink -- "$path" || true)" = "$target" ]; then
        printf '%s\n' "$target"
    else
        bbb_die "$path is not the image's link to $target; use the Tier 3 files in /etc/bigbluebutton/recording for overrides"
    fi
}

# write_file DEST MODE COMMAND [ARGS...] — write the command's output to DEST atomically.
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

# bigbluebutton_yml — upstream's bigbluebutton.yml as bare metal has it: playback_host set
# with yq-go (bbb-record-core after-install.sh) and then with bbb-conf --setip's
# change_yml_value, which also changes the commented DEVELOPMENT line. redis and the shared
# notes server are services of the stack, not on 127.0.0.1.
bigbluebutton_yml() {
    yq-go '.playback_host = strenv(BBB_DOMAIN)
        | .redis_host = "redis"
        | .bn_notes_endpoint = "http://shared-notes:8787/loopback/api/documents"' \
        "$DEFAULTS/bigbluebutton.yml" \
        | sed "s<^\([[:blank:]#]*\)\(playback_host\): .*<\1\2: ${BBB_DOMAIN}<"
}

# cron_script — bbb-config's daily cleanup. With RECORDING_RAW_RETENTION_DAYS=0 the raw data of
# published recordings is kept: the call is commented out, as the documentation says to do on
# bare metal (docs/docs/administration/customize.md, "Delete raw data from published
# recordings").
cron_script() {
    if [ "$RECORDING_RAW_RETENTION_DAYS" = 0 ]; then
        sed 's/^remove_raw_of_published_recordings$/#&/' "$DEFAULTS/cron.daily/bigbluebutton"
    else
        cat "$DEFAULTS/cron.daily/bigbluebutton"
    fi
}

role="$1"

# 1. validate (patterns: docker/config-contract.yaml)
bbb_require BBB_DOMAIN
bbb_require_match BBB_DOMAIN '([A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?'
# The shared secret signs the callbacks of the workers (post_publish, post_events); the other
# processes do not read it.
if [ "$role" = bbb-rap-resque-worker ] || [ -n "${BBB_SHARED_SECRET:-}" ]; then
    # Format first: the placeholder message would quote a value such as "secret" verbatim.
    bbb_require BBB_SHARED_SECRET
    bbb_require_match BBB_SHARED_SECRET '[A-Za-z0-9]{32,}'
    bbb_require_secret BBB_SHARED_SECRET
    hash="$(printf '%s' "$BBB_SHARED_SECRET" | sha256sum)"
    [ "${hash%% *}" != "$UPSTREAM_SALT_SHA256" ] \
        || bbb_die "BBB_SHARED_SECRET is set to upstream's public default securitySalt; set a generated secret"
    render_secret=1
else
    render_secret=0
fi
bbb_default RECORDING_WORKERS 1
bbb_require_match RECORDING_WORKERS '[1-9][0-9]{0,2}'
bbb_default RECORDING_RAW_RETENTION_DAYS 14
bbb_require_match RECORDING_RAW_RETENTION_DAYS '[0-9]{1,5}'

# 2. derive
export BBB_DOMAIN
# The cleanup's name for the retention of the raw data of published recordings.
# shellcheck disable=SC2034 # written by bbb_write_shell_vars below
published_days="$RECORDING_RAW_RETENTION_DAYS"

# 3. render
dest="$(render_dest "$CORE/scripts/bigbluebutton.yml" bigbluebutton.yml)"
write_file "$dest" 0644 bigbluebutton_yml

if [ "$render_secret" = 1 ]; then
    dest="$(render_dest /etc/bigbluebutton/bbb-web.properties bbb-web.properties)"
    bbb_render --mode 0600 "$DEFAULTS/bbb-web.properties" "$dest"
fi

dest="$(render_dest /etc/default/bigbluebutton-cron-config bigbluebutton-cron-config)"
bbb_write_shell_vars --mode 0644 "$dest" published_days
dest="$(render_dest /etc/cron.daily/bigbluebutton cron.daily-bigbluebutton)"
write_file "$dest" 0755 cron_script

# 4. merge: the recording scripts read the Tier 3 files themselves.
for file in /etc/bigbluebutton/recording/recording.yml /etc/bigbluebutton/recording/presentation.yml; do
    if [ -r "$file" ]; then bbb_log "Tier 3 file $file is present; the recording scripts read it"; fi
done

# The directories of the data volume that the packages create (bbb-record-core and
# bbb-playback-presentation after-install.sh, bbb-record-core build.sh); the log directory of
# the presentation format.
if ! bbb_is_render_only; then
    mkdir -p /var/bigbluebutton/recording/{raw,process,publish/presentation} \
        /var/bigbluebutton/recording/status/{recorded,archived,processed,sanity,published,ended} \
        /var/bigbluebutton/{events,captions/inbox,published/presentation,deleted,unpublished,basic_stats} \
        /var/log/bigbluebutton/presentation \
        || bbb_die "cannot create the recording directories below /var/bigbluebutton"
fi

# 5. exec: the ExecStart, WorkingDirectory and Environment of each unit
# (record-and-playback/core/systemd/*.service). tini (PID 1) passes signals to the process group.
case "$role" in
    bbb-rap-resque-worker)
        cd "$CORE/scripts"
        export QUEUE=rap:archive,rap:publish,rap:process,rap:sanity,rap:captions,rap:events
        export COUNT="$RECORDING_WORKERS"
        set -- /usr/bin/bundle exec rake -f Rakefile resque:workers
        ;;
    bbb-rap-starter)
        cd "$CORE/scripts"
        set -- "$CORE/scripts/rap-starter.rb"
        ;;
    bbb-rap-caption-inbox)
        cd "$CORE"
        set -- "$CORE/scripts/rap-caption-inbox.rb"
        ;;
    bbb-recording-cleanup)
        set -- /usr/local/lib/bbb/recording/cleanup.sh
        ;;
esac
bbb_exec "$@"
