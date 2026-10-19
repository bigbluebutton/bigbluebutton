#!/usr/bin/env bash
# Entrypoint of the livekit-server image. Writes /run/livekit-server/livekit.yaml like the
# bare-metal unit does (build/packages-template/bbb-livekit/livekit-server.service): the
# packaged default with the container wiring, merged with the Tier 3 override
# /etc/bigbluebutton/livekit.yaml. The key pair is
# never written to a file: livekit-server reads it from LIVEKIT_KEYS, the address to announce
# from NODE_IP (both native livekit-server environment variables).
set -euo pipefail          # never set -x: xtrace prints every value, secrets included
# shellcheck source=docker/lib/entrypoint-lib.sh
source /usr/local/lib/bbb/entrypoint-lib.sh
BBB_LOG_TAG=livekit

bbb_init "$@"
set -- "${BBB_ARGS[@]}"
[ "$#" -gt 0 ] || set -- livekit-server --config /run/livekit-server/livekit.yaml

# 1. validate
bbb_require_match BBB_PUBLIC_IPV4 '((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])'
# Format first: its message never contains the value. The placeholder message of
# bbb_require_secret contains the word "secret", which is itself a placeholder value.
bbb_require_match LIVEKIT_API_KEY '[A-Za-z0-9]{8,64}'
bbb_require_match LIVEKIT_API_SECRET '[A-Za-z0-9]{32,}'
bbb_require_secret LIVEKIT_API_KEY LIVEKIT_API_SECRET
bbb_default LIVEKIT_RTC_UDP_PORT 7882
bbb_require_match LIVEKIT_RTC_UDP_PORT '[1-9][0-9]{0,4}'
[ "$LIVEKIT_RTC_UDP_PORT" -le 65535 ] || bbb_die "LIVEKIT_RTC_UDP_PORT is not a port number (1-65535)"

# 2. derive (contract: livekit_node_ip, livekit_keys)
export NODE_IP="$BBB_PUBLIC_IPV4"
export LIVEKIT_KEYS="$LIVEKIT_API_KEY: $LIVEKIT_API_SECRET"

# 3. render: the container wiring merged over the packaged default (the unit's merge), then
# UDP port and webhook key (YAML values set by yq). No secret in this file; mode below.
override=/etc/bigbluebutton/livekit.yaml
dest="$(bbb_path /run/livekit-server/livekit.yaml)"
mkdir -p "$(dirname "$dest")"
export LIVEKIT_RTC_UDP_PORT LIVEKIT_API_KEY
# shellcheck disable=SC2016
yq eval-all '. as $item ireduce ({}; . * $item) | ... comments = ""
    | .rtc.udp_port = (strenv(LIVEKIT_RTC_UDP_PORT) | to_number) | .webhook.api_key = strenv(LIVEKIT_API_KEY)' \
    /usr/share/livekit-server/livekit.yaml /usr/local/share/bbb/livekit/livekit.yaml >"$dest"

# 4. merge the Tier 3 override; its settings take precedence, as on bare metal
bbb_merge_yaml --mode 0600 "$dest" "$override" "$dest"

# Settings an override must not change: compose publishes LIVEKIT_RTC_UDP_PORT, and the
# webhook key must be the key in LIVEKIT_KEYS (keys in the override are ignored, the
# environment wins in livekit-server).
[ "$(yq '.rtc.udp_port' "$dest")" = "$LIVEKIT_RTC_UDP_PORT" ] \
    || bbb_die "rtc.udp_port is set in $override; set LIVEKIT_RTC_UDP_PORT instead"
[ "$(yq '.webhook.api_key' "$dest")" = "$LIVEKIT_API_KEY" ] \
    || bbb_die "webhook.api_key in $override is not LIVEKIT_API_KEY; remove it from $override"
if [ "$(yq '.keys // {} | length' "$dest")" -gt 0 ]; then
    bbb_log "WARNING: keys in $override are ignored; the key pair is LIVEKIT_API_KEY/LIVEKIT_API_SECRET"
    yq -i 'del(.keys)' "$dest"
fi
if [ "$(yq '(.rtc.port_range_start // 0) + (.rtc.port_range_end // 0)' "$dest")" -ne 0 ]; then
    bbb_log "WARNING: rtc.port_range_start/end set in $override; livekit-server then ignores rtc.udp_port"
fi
if [ -n "$(yq '.rtc.node_ip // ""' "$dest")" ]; then
    bbb_log "WARNING: rtc.node_ip in $override is ignored; livekit-server announces NODE_IP, which is BBB_PUBLIC_IPV4: set BBB_PUBLIC_IPV4 instead"
fi
# The level livekit-server uses: log_level, else logging.level, else debug in development mode.
level="$(yq '.log_level // ""' "$dest")"
[ -n "$level" ] || level="$(yq '.logging.level // ""' "$dest")"
[ -n "$level" ] || [ "$(yq '.development // false' "$dest")" != true ] || level=debug
if [ "${level,,}" = debug ]; then
    bbb_log "WARNING: livekit-server logs at debug level ($override); its debug log contains the TURN credentials sent to every participant"
fi

# livekit-server reads the secret from LIVEKIT_KEYS; it needs no second copy.
unset LIVEKIT_API_SECRET

# 5. exec
bbb_exec "$@"
