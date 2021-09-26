#!/bin/bash -e

if [ "$1" = "remove" ]; then
	# In BigBlueButton 2.4-alphas and betas bbb-learning-dashboard was called bbb-activity-report
	# Here we perform cleanup in case we are upgrading from an early 2.4 version
	if [ -d "/var/bigbluebutton/activity-report" ]; then
		rm -fr /var/bigbluebutton/activity-report
		rm -f /etc/bigbluebutton/nginx/activity-report.nginx
	fi

	rm -fr /var/bigbluebutton/learning-dashboard
	rm -f /etc/bigbluebutton/nginx/learning-dashboard.nginx
fi
