#!/bin/bash -e

if [ -f /usr/local/bigbluebutton/core/scripts/presentation.yml.orig ]; then
  create_keep_file /usr/local/bigbluebutton/core/scripts/presentation.yml
elif [ -f /usr/local/bigbluebutton/core/scripts/presentation.yml ]; then
  cp /usr/local/bigbluebutton/core/scripts/presentation.yml /tmp
fi

