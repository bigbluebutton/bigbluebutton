#!/usr/bin/env bash
# Fixture entrypoint: helper calls, a local variable, ignored names. ${COMMENTED_OUT}
# shellcheck source=/dev/null
source /usr/local/lib/bbb/entrypoint-lib.sh
bbb_init "$@"
set -- "${BBB_ARGS[@]}"
bbb_require BBB_DOMAIN
bbb_require_secret TURN_SECRET
bbb_require_match BBB_DOMAIN '[A-Za-z0-9.-]+'
bbb_default RECORDING_WORKERS 1
LOCAL_URL="https://${BBB_DOMAIN}"
export LOCAL_URL
dest="$(bbb_path /etc/web/app.conf)"
bbb_render /usr/local/share/web/app.conf.tmpl "$dest"
echo "home is $HOME"
bbb_exec "$@"
