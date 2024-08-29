#!/bin/bash -e

case "$1" in
  install|upgrade|1|2)

    # the config is not longer env vars at /etc/default/bbb-graphql-middleware
    if [ -f /etc/default/bbb-graphql-middleware ]; then
      rm /etc/default/bbb-graphql-middleware
    fi

  ;;
esac
