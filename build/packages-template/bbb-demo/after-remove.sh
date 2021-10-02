#!/bin/bash -e

if [ "$1" = "remove" ]; then
	rm -f /var/lib/$TOMCAT_SERVICE/webapps/demo.war
	rm -f /var/www/bigbluebutton/client/demo11.html
	rm -f /var/www/bigbluebutton/client/images/headset*
fi

