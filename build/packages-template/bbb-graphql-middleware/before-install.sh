#!/bin/bash -e

case "$1" in
  install|upgrade|1|2)

    # the config is not longer env vars at /etc/bigbluebutton/bbb-graphql-middleware
    if [ -f /etc/bigbluebutton/bbb-graphql-middleware ]; then
      rm /etc/bigbluebutton/bbb-graphql-middleware
    fi

  ;;
esac
