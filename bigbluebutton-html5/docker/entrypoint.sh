#!/usr/bin/env bash
# html5 client entrypoint: serves the built client with nginx on port 8080, in the foreground.
# The client reads no environment: its settings.yml is the build's (the admin's
# /etc/bigbluebutton/bbb-html5.yml is merged by akka-apps and reaches the client through the
# API), so nothing is rendered at start.
set -euo pipefail
# shellcheck source=docker/lib/entrypoint-lib.sh
source /usr/local/lib/bbb/entrypoint-lib.sh
BBB_LOG_TAG=html5

bbb_init "$@"
set -- "${BBB_ARGS[@]}"
[ "$#" -gt 0 ] || set -- nginx -g 'daemon off;'

# Files the image ships at their bare-metal paths; nginx reads them in place. In render-only
# mode a copy is written so that tests see the client settings and the nginx configuration.
if bbb_is_render_only; then
    for file in /usr/share/bigbluebutton/html5-client/private/config/settings.yml \
        /etc/nginx/nginx.conf /etc/nginx/conf.d/html5-client.conf \
        /usr/share/bigbluebutton/nginx/bbb-html5.nginx \
        /usr/share/bigbluebutton/nginx/bbb-html5.nginx.static; do
        dest="$(bbb_path "$file")"
        mkdir -p -- "$(dirname -- "$dest")"
        cp -- "$file" "$dest"
    done
fi

bbb_exec "$@"
