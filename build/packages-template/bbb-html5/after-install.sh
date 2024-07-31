#!/bin/bash -e

BIGBLUEBUTTON_USER=bigbluebutton

# set ownership of activity directory
chown -R $BIGBLUEBUTTON_USER:$BIGBLUEBUTTON_USER /var/bigbluebutton/html5-client/
#
# Restart nginx to take advantage of the updates to nginx configuration
#
reloadService nginx