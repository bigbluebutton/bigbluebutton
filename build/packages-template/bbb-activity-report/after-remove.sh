#!/bin/bash -e

if [ "$1" = "remove" ]; then
	rm -fr /var/bigbluebutton/activity-report
	rm -f /etc/bigbluebutton/nginx/activity-report.nginx
fi

