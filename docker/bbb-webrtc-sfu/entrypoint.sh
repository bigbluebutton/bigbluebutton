#!/usr/bin/env bash
# Entrypoint of the bbb-webrtc-sfu image. The SFU reads its configuration with node-config
# from NODE_CONFIG_DIR (Dockerfile): upstream's /app/config/production.yml, the package's
# changes /usr/local/share/bbb/bbb-webrtc-sfu/production.yml, the Tier 3 override
# /etc/bigbluebutton/bbb-webrtc-sfu/production.yml if mounted, then environment variables.
# This entrypoint only validates and exports those variables; it renders nothing.
set -euo pipefail          # never set -x: xtrace prints every value, secrets included
# shellcheck source=docker/lib/entrypoint-lib.sh
source /usr/local/lib/bbb/entrypoint-lib.sh
BBB_LOG_TAG=bbb-webrtc-sfu

bbb_init "$@"
set -- "${BBB_ARGS[@]}"
[ "$#" -gt 0 ] || set -- node server.js

# 1. validate. The patterns also reject the placeholders shipped in default.example.yml
# (BBB_DOMAIN, LIVEKIT_KEY, LIVEKIT_SECRET), which upstream accepts.
bbb_require_match BBB_DOMAIN '([A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?'
# Format first: its message never contains the value. The placeholder message of
# bbb_require_secret contains the word "secret", which is itself a placeholder value.
bbb_require_match LIVEKIT_API_KEY '[A-Za-z0-9]{8,64}'
bbb_require_match LIVEKIT_API_SECRET '[A-Za-z0-9]{32,}'
bbb_require_secret LIVEKIT_API_KEY LIVEKIT_API_SECRET
# Container wiring, set in the image.
bbb_require LIVEKIT_ENABLED LIVEKIT_HOST REDIS_HOST CLIENT_HOST

# 2. derive (contract: sfu_livekit), node-config environment variables
export LIVEKIT_KEY="$LIVEKIT_API_KEY"
export LIVEKIT_SECRET="$LIVEKIT_API_SECRET"
export LIVEKIT_BBB_DOMAIN="$BBB_DOMAIN"
unset LIVEKIT_API_SECRET

# 3. render: nothing at start. In render-only mode, write out the image's changes to
# upstream's configuration, for the golden-file test.
if bbb_is_render_only; then
    base=/usr/local/share/bbb/bbb-webrtc-sfu/production.yml
    dest="$(bbb_path "$base")"
    mkdir -p "$(dirname "$dest")"
    cp "$base" "$dest"
fi

# 4. merge: node-config merges the Tier 3 override itself.

# 5. exec
bbb_exec "$@"
