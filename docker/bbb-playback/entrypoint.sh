#!/usr/bin/env bash
# Playback entrypoint: serves the presentation player with nginx on port 8080, in the
# foreground. The player reads no environment (it fetches each recording from
# /presentation/<recordId>/ of the host that serves it), so nothing is rendered at start.
set -euo pipefail
# shellcheck source=docker/lib/entrypoint-lib.sh
source /usr/local/lib/bbb/entrypoint-lib.sh
BBB_LOG_TAG=playback

bbb_init "$@"
set -- "${BBB_ARGS[@]}"
[ "$#" -gt 0 ] || set -- nginx -g 'daemon off;'

# Files the image ships; nginx reads them in place. In render-only mode a copy is written so
# that tests see the nginx configuration and the player version.
if bbb_is_render_only; then
    for file in /etc/nginx/nginx.conf /etc/nginx/conf.d/playback.conf \
        /usr/share/bigbluebutton/nginx/playback.nginx \
        /usr/share/bigbluebutton/playback/presentation/2.3/bbb-playback-version; do
        dest="$(bbb_path "$file")"
        mkdir -p -- "$(dirname -- "$dest")"
        cp -- "$file" "$dest"
    done
fi

bbb_exec "$@"
