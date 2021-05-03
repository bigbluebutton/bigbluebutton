#!/usr/bin/env bash
IS_BBB_WEB_RUNNING=`netstat -an | grep LISTEN | grep 8090 > /dev/null && echo 1 || echo 0`

if [ "$IS_BBB_WEB_RUNNING" = "1" ]; then
	echo "bbb-web is running, exiting"
	exit 1
fi

echo "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
echo "  **** This is for development only *****"
echo " "
echo " Make sure you change permissions to /var/bigbluebutton/"
echo " to allow bbb-web to write to the directory. "
echo " "
echo " chmod -R 777 /var/bigbluebutton/"
echo " "
echo "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"


exec grails prod run-app --port 8090
