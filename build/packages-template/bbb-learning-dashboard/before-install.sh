#!/bin/bash -e

if [ -f /etc/bigbluebutton/nginx/activity-report.nginx ]; then
  rm -f /etc/bigbluebutton/nginx/activity-report.nginx
fi

