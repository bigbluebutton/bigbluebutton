#!/bin/bash -e

if [ -f /usr/local/bigbluebutton/core/scripts/bigbluebutton.yml.orig ]; then
  create_keep_file /usr/local/bigbluebutton/core/scripts/bigbluebutton.yml
elif [ -f /usr/local/bigbluebutton/core/scripts/bigbluebutton.yml ]; then
  cp /usr/local/bigbluebutton/core/scripts/bigbluebutton.yml /tmp
fi

