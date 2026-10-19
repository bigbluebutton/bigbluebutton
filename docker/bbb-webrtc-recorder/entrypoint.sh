#!/usr/bin/env bash
# Entrypoint of the bbb-webrtc-recorder image. The recorder loads exactly one configuration
# file, then its BBBRECORDER_* environment variables. This entrypoint writes that one file,
# /run/bbb-webrtc-recorder/bbb-webrtc-recorder.yml: the packaged default
# /etc/bbb-webrtc-recorder/bbb-webrtc-recorder.yml with the container wiring merged over it,
# then the Tier 3 override /etc/bigbluebutton/bbb-webrtc-recorder.yml (as `bbb-conf` shows the
# two merged on bare metal). The LiveKit key pair is never written to a file: as on bare metal
# (/etc/default/bbb-webrtc-recorder), the recorder reads it from BBBRECORDER_LIVEKIT_APIKEY and
# BBBRECORDER_LIVEKIT_APISECRET.
set -euo pipefail          # never set -x: xtrace prints every value, secrets included
# shellcheck source=docker/lib/entrypoint-lib.sh
source /usr/local/lib/bbb/entrypoint-lib.sh
BBB_LOG_TAG=bbb-webrtc-recorder

bbb_init "$@"
set -- "${BBB_ARGS[@]}"
[ "$#" -gt 0 ] || set -- bbb-webrtc-recorder -c /run/bbb-webrtc-recorder/bbb-webrtc-recorder.yml

# 1. validate
# Format first: its message never contains the value. The placeholder message of
# bbb_require_secret contains the word "secret", which is itself a placeholder value.
bbb_require_match LIVEKIT_API_KEY '[A-Za-z0-9]{8,64}'
bbb_require_match LIVEKIT_API_SECRET '[A-Za-z0-9]{32,}'
bbb_require_secret LIVEKIT_API_KEY LIVEKIT_API_SECRET

# 2. derive (contract: recorder_livekit), the recorder's own environment variables
export BBBRECORDER_LIVEKIT_APIKEY="$LIVEKIT_API_KEY"
export BBBRECORDER_LIVEKIT_APISECRET="$LIVEKIT_API_SECRET"
unset LIVEKIT_API_SECRET

# 3. render: the container wiring merged over the packaged default. No secret in this file.
recordings=/var/lib/bbb-webrtc-recorder
override=/etc/bigbluebutton/bbb-webrtc-recorder.yml
dest="$(bbb_path /run/bbb-webrtc-recorder/bbb-webrtc-recorder.yml)"
mkdir -p "$(dirname "$dest")"
# The same deep merge as bbb_merge_yaml; the wiring file's own comments are left out, so that
# the result keeps the packaged default's comments only.
yq eval-all 'select(fileIndex == 0) * (select(fileIndex == 1) | ... comments = "")' \
    /etc/bbb-webrtc-recorder/bbb-webrtc-recorder.yml \
    /usr/local/share/bbb/bbb-webrtc-recorder/bbb-webrtc-recorder.yml >"$dest"

# 4. merge the Tier 3 override; its settings take precedence, as on bare metal
bbb_merge_yaml "$dest" "$override" "$dest"

# Settings an override must not change: the recordings are on the volume at this path, and
# bbb-webrtc-sfu and the recording processing use the path as it is.
[ "$(yq '.recorder.directory' "$dest")" = "$recordings" ] \
    || bbb_die "recorder.directory is changed in $override; it must stay $recordings"
if [ -n "$(yq '(.livekit.apiKey // "") + (.livekit.apiSecret // "")' "$dest")" ]; then
    bbb_log "WARNING: livekit.apiKey/apiSecret in $override are ignored; the key pair is LIVEKIT_API_KEY/LIVEKIT_API_SECRET"
    yq -i '.livekit.apiKey = "" | .livekit.apiSecret = ""' "$dest"
fi

# 5. exec
bbb_exec "$@"
