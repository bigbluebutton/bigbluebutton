#!/bin/bash -e

if [ -f /usr/local/bigbluebutton/core/scripts/podcast.yml.orig ]; then
  create_keep_file /usr/local/bigbluebutton/core/scripts/podcast.yml
elif [ -f /usr/local/bigbluebutton/core/scripts/podcast.yml ]; then
  cp /usr/local/bigbluebutton/core/scripts/podcast.yml /tmp
fi

