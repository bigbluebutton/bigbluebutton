#!/bin/sh
set -e

cat >> /etc/bigbluebutton/bbb-web.properties << 'EOF'
bigbluebutton.web.serverURL=${BBB_SERVER_URL}
securitySalt=${SHARED_SECRET}
EOF

# Allow additional JVM options via JAVA_OPTS environment variable
exec java ${JAVA_OPTS} -Dgrails.env=prod -Dserver.address=0.0.0.0 -Dserver.port=8090 -Dspring.main.allow-circular-references=true -Xms384m -Xmx384m -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/var/bigbluebutton/diagnostics -cp WEB-INF/lib/*:/:WEB-INF/classes/:. org.springframework.boot.loader.WarLauncher "$@"
