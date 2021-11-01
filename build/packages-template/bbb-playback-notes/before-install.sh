#!/bin/bash -e

if [ -f /usr/local/bigbluebutton/core/scripts/notes.yml.orig ]; then
  create_keep_file /usr/local/bigbluebutton/core/scripts/notes.yml
elif [ -f /usr/local/bigbluebutton/core/scripts/notes.yml ]; then
  cp /usr/local/bigbluebutton/core/scripts/notes.yml /tmp
fi

