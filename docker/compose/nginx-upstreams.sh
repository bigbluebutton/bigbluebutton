#!/bin/sh
# The packages' location files proxy to 127.0.0.1. This writes them with the service names to
# /etc/bigbluebutton/nginx (a tmpfs), which the site includes, before nginx starts.
set -eu
for f in /usr/share/bigbluebutton/nginx/*.nginx; do
  sed -e 's|127.0.0.1:8090|web:8090|' -e 's|127.0.0.1:8378|graphql-middleware:8378|' \
    -e 's|127.0.0.1:7880|livekit:7880|' -e 's|127.0.0.1:3008|webrtc-sfu:3008|' \
    -e 's|localhost:8787|shared-notes-server:8787|' "$f" > "/etc/bigbluebutton/nginx/${f##*/}"
done
# 127.0.0.1:8185 is nginx itself (hasura-loadbalancer.conf); any other loopback address is a
# backend this script does not know yet
if grep -n "127.0.0.1:\|localhost:" /etc/bigbluebutton/nginx/*.nginx | grep -v "127.0.0.1:8185\|#.*127.0.0.1"; then
  echo "nginx-upstreams.sh: a location file still proxies to a loopback address" >&2
  exit 1
fi
