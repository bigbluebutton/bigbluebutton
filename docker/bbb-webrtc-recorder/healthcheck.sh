#!/usr/bin/env bash
# Healthcheck of the bbb-webrtc-recorder image. The recorder has no listener of its own (its
# HTTP test server and metrics are off, as packaged), so it is healthy while it holds an
# established connection to redis, its control channel, and can write its recordings
# directory. The redis port is the one of the configuration the recorder runs with.
set -euo pipefail

config=/run/bbb-webrtc-recorder/bbb-webrtc-recorder.yml
address="$(yq '.pubsub.adapters.redis.address // ""' "$config")"
port="${address##*:}"
[[ "$port" =~ ^[0-9]{1,5}$ ]] || { echo "no redis port in $config" >&2; exit 1; }
directory="$(yq '.recorder.directory' "$config")"
[ -w "$directory" ] || { echo "$directory is not writable" >&2; exit 1; }

# /proc/net/tcp{,6}: remote address in field 3 (hex ADDR:PORT), state in field 4 (01 established).
remote_port="$(printf '%04X' "$port")"
for table in /proc/net/tcp /proc/net/tcp6; do
    [ -r "$table" ] || continue
    while read -r _ _ remote state _; do
        if [ "$state" = 01 ] && [ "${remote##*:}" = "$remote_port" ]; then
            exit 0
        fi
    done <"$table"
done
echo "no established connection to redis port $port" >&2
exit 1
