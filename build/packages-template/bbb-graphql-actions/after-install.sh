#!/bin/bash -e

case "$1" in
  configure|upgrade|1|2)

  fc-cache -f
  if [ ! -f /.dockerenv ]; then
    systemctl enable bbb-graphql-actions.service
    systemctl daemon-reload
    startService bbb-graphql-actions.service || echo "bbb-graphql-actions service could not be registered or started"
  fi
  ;;

  abort-upgrade|abort-remove|abort-deconfigure)
  ;;

  *)
    echo "postinst called with unknown argument \`$1'" >&2
    exit 1
  ;;
esac
