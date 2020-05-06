#!/bin/bash
java -Dgrails.env=prod -Dserver.address=127.0.0.1 -Dserver.port=8090 -Xms384m -Xmx384m -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/var/bigbluebutton/diagnostics -cp WEB-INF/lib/*:/:WEB-INF/classes/:. org.springframework.boot.loader.WarLauncher

