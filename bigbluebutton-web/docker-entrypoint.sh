#!/bin/sh
set -e

# Adjust serverURL and securitySalt in bbb-web.properties
cat >> /etc/bigbluebutton/bbb-web.properties << 'EOF'
bigbluebutton.web.serverURL=https://${BBB_SERVER_URL}
securitySalt=${SHARED_SECRET}
defaultHTML5ClientUrl=${bigbluebutton.web.serverURL}/html5client/
EOF

# Configure Turn server settings if provided
if [ -n "${TURN_DOMAIN}" ] && [ -n "${TURN_SECRET}" ]; then
    mv /etc/bigbluebutton/turn-stun-servers.xml.tmpl /etc/bigbluebutton/turn-stun-servers.xml
    sed -i "s|{{ .Env.TURN_DOMAIN }}|${TURN_DOMAIN}|g" /etc/bigbluebutton/turn-stun-servers.xml
    sed -i "s|{{ .Env.TURN_SECRET }}|${TURN_SECRET}|g" /etc/bigbluebutton/turn-stun-servers.xml
fi


# Set log level
sed -i "s|BBB_WEB_LOGLEVEL|${BBB_WEB_LOGLEVEL:-INFO}|g" /usr/share/bbb-web/WEB-INF/classes/logback.xml

# Allow additional JVM options via JAVA_OPTS environment variable
exec java ${JAVA_OPTS} -Dgrails.env=prod -Dserver.address=0.0.0.0 -Dserver.port=8090 -Dspring.main.allow-circular-references=true -Xms384m -Xmx384m -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/var/bigbluebutton/diagnostics -cp WEB-INF/lib/*:/:WEB-INF/classes/:. org.springframework.boot.loader.WarLauncher "$@"
