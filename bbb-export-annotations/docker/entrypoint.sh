#!/usr/bin/env bash
# Entrypoint of the bbb-export-annotations image. The app reads no environment: master.js and
# every worker read ./config/settings.json relative to the working directory, which is
# /usr/local/bigbluebutton/bbb-export-annotations as in the systemd unit. This entrypoint writes
# that file from the packaged one with the container wiring set; upstream has no override file
# for it.
set -euo pipefail          # never set -x: xtrace prints every value, secrets included
# shellcheck source=docker/lib/entrypoint-lib.sh
source /usr/local/lib/bbb/entrypoint-lib.sh
BBB_LOG_TAG=export-annotations

bbb_init "$@"
set -- "${BBB_ARGS[@]}"
[ "$#" -gt 0 ] || set -- node master.js

# 1. validate: nothing. No contract variable reaches the app (BBB_UID/BBB_GID are the
# container's user, set by compose).

# 2. derive: nothing. bbb-web and redis are the compose service names on the bbb network.

# 3. render: the packaged settings.json with the peers set by yq; everything else, key order
# and layout (two-space JSON) stay upstream's.
dest="$(bbb_path /usr/local/bigbluebutton/bbb-export-annotations/config/settings.json)"
mkdir -p "$(dirname "$dest")"
yq -p json -o json -I 2 '
    .bbbWebAPI = "http://bbb-web:8090" |
    .redis.host = "redis"
  ' /usr/local/share/bbb-export-annotations/settings.json >"$dest"

# 4. merge: none (no Tier 3 file for this component).

# 5. exec
bbb_exec "$@"
