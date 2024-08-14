#!/bin/bash -e

case "$1" in
  install|upgrade|1|2)

    # the configuration file has moved from /etc/bigbluebutton/bbb-graphql-server
    # to /usr/share/bbb-graphql-server/bbb-graphql-server.env
    if [ -f /etc/bigbluebutton/bbb-graphql-server ]; then
      rm /etc/bigbluebutton/bbb-graphql-server
    fi

  ;;
esac
