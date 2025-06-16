#!/usr/bin/env bash
IS_BBB_WEB_RUNNING=`ss -an | grep LISTEN | grep 8090 > /dev/null && echo 1 || echo 0`

if [ "$IS_BBB_WEB_RUNNING" = "1" ]; then
	echo "bbb-web is running, exiting"
	exit 1
fi

if [ "`whoami`" != "bigbluebutton" ]; then
	echo "ERROR:  bbb-web must run as bigbluebutton user ( because of the uploaded files permissions )"
	exit 1
fi

exec ./gradlew bootRun --args='--server.port=8090' -Dspring.profiles.active=prod
