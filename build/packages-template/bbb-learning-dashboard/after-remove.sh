#!/bin/bash -e

if [ "$1" = "remove" ]; then
	rm -fr /var/bigbluebutton/learning-dashboard
	rm -f /usr/share/bigbluebutton/nginx/learning-dashboard.nginx
fi
