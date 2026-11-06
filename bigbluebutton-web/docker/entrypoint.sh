#!/bin/sh
# bbb-web takes its properties only from files, not from the environment: write the named
# variables to the bare-metal override file, unless the deployment mounts one.
f=/etc/bigbluebutton/bbb-web.properties
if [ ! -e "$f" ]; then
    [ -z "$SERVER_URL" ] || echo "bigbluebutton.web.serverURL=$SERVER_URL" >> "$f"
    [ -z "$SHARED_SECRET" ] || echo "securitySalt=$SHARED_SECRET" >> "$f"
    [ -z "$REDIS_HOST" ] || echo "redisHost=$REDIS_HOST" >> "$f"
fi
exec "$@"
