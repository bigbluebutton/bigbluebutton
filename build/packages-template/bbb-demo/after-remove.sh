#!/bin/bash -e

if [ "$1" = "remove" ]; then
	rm -f /var/lib/$TOMCAT_SERVICE/webapps/demo.war
	rm -rf /var/lib/$TOMCAT_SERVICE/webapps/demo
	rm -f /usr/share/bigbluebutton/nginx/demo.nginx
fi

