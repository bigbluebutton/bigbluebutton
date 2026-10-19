#!/usr/bin/env bash
# Learning dashboard entrypoint: serves the dashboard app with nginx on port 8080, in the
# foreground. The app reads no environment, so nothing is rendered at start.
set -euo pipefail
# shellcheck source=docker/lib/entrypoint-lib.sh
source /usr/local/lib/bbb/entrypoint-lib.sh
BBB_LOG_TAG=learning-dashboard

bbb_init "$@"
set -- "${BBB_ARGS[@]}"
[ "$#" -gt 0 ] || set -- nginx -g 'daemon off;'

# Files the image ships; nginx reads them in place. In render-only mode a copy is written so
# that tests see the nginx configuration.
if bbb_is_render_only; then
    for file in /etc/nginx/nginx.conf /etc/nginx/conf.d/learning-dashboard.conf \
        /usr/share/bigbluebutton/nginx/learning-dashboard.nginx; do
        dest="$(bbb_path "$file")"
        mkdir -p -- "$(dirname -- "$dest")"
        cp -- "$file" "$dest"
    done
fi

bbb_exec "$@"
