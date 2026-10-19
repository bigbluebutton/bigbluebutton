#!/usr/bin/env bash
# Healthcheck of the bbb-export-annotations image. The app has no port: master.js waits for jobs
# with a blocking pop on a redis list and keeps that connection open (master.js). Healthy when
# `node master.js` runs and the container has an established TCP connection to the redis port
# of its settings.json, so a worker that lost redis is reported until it has reconnected.
set -euo pipefail

settings=/usr/local/bigbluebutton/bbb-export-annotations/config/settings.json

found=0
for f in /proc/[0-9]*/cmdline; do
    if [ "$(tr '\0' ' ' <"$f" 2>/dev/null)" = "node master.js " ]; then found=1; break; fi
done
[ "$found" -eq 1 ] || { echo "node master.js is not running"; exit 1; }

port="$(yq -p json -o json '.redis.port' "$settings")"
[[ "$port" =~ ^[0-9]+$ ]] || { echo "no redis port in $settings"; exit 1; }
# /proc/net/tcp{,6}: remote address is field 3 (hex ip:port), state field 4 (01 = ESTABLISHED).
tables=()
for t in /proc/net/tcp /proc/net/tcp6; do [ -r "$t" ] && tables+=("$t"); done
if [ "${#tables[@]}" -gt 0 ] && awk -v p="$(printf ':%04X' "$port")" 'FNR > 1 && substr($3, length($3) - 4) == p && $4 == "01" { ok = 1 } END { exit !ok }' \
        "${tables[@]}"; then
    exit 0
fi
echo "no established connection to redis port $port"
exit 1
