#!/bin/bash -e

case "$1" in
  configure|upgrade|1|2)

  fc-cache -f

  systemctl daemon-reload
  startService bbb-graphql-middleware || echo "bbb-graphql-middleware service could not be registered or started"
  reloadService nginx
  ;;

  abort-upgrade|abort-remove|abort-deconfigure)
  ;;

  *)
    echo "postinst called with unknown argument \`$1'" >&2
    exit 1
  ;;
esac
