#!/bin/sh
# Point the default config at the other services; a mounted config (file or directory) is left as it is
set -e
f=/usr/local/bigbluebutton/bbb-export-annotations/config/settings.json
if ! grep -qF -e " $f " -e " ${f%/*} " /proc/self/mountinfo; then
  [ -z "$BBB_REDIS_HOST" ] || sed -i "s|\"host\": \"127.0.0.1\"|\"host\": \"$BBB_REDIS_HOST\"|" "$f"
  [ -z "$BBB_WEB_HOST" ] || sed -i "s|127.0.0.1:8090|$BBB_WEB_HOST:8090|" "$f"
fi
exec "$@"
