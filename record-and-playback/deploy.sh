#!/bin/bash

sudo cp -r core/lib/recordandplayback/* /usr/local/bigbluebutton/core/lib/recordandplayback/

PLAYBACK_LIST="slides presentation"

for PLAYBACK in $PLAYBACK_LIST
do
  sudo cp -r $PLAYBACK/playback/* /var/bigbluebutton/playback/
  sudo cp -r $PLAYBACK/scripts/* /usr/local/bigbluebutton/core/scripts/
done

sudo chown -R tomcat6:tomcat6 /var/bigbluebutton/playback/
sudo cp /usr/local/bigbluebutton/core/scripts/*.nginx /etc/bigbluebutton/nginx/
