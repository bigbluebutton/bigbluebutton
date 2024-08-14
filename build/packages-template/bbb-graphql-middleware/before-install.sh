#!/bin/bash -e

case "$1" in
  install|upgrade|1|2)

    # the configuration file has moved from /etc/bigbluebutton/bbb-graphql-middleware
    # to /usr/share/bbb-graphql-middleware/bbb-graphql-server.env
    if [ -f /etc/bigbluebutton/bbb-graphql-middleware ]; then
      rm /etc/bigbluebutton/bbb-graphql-middleware
    fi

  ;;
esac
