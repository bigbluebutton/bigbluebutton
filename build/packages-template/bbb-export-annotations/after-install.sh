#!/bin/bash -e

case "$1" in
  configure|upgrade|1|2)

  startService bbb-export-annotations.service || echo "bbb-export-annotations service could not be registered or started"
  ;;

  abort-upgrade|abort-remove|abort-deconfigure)
  ;;

  *)
    echo "postinst called with unknown argument \`$1'" >&2
    exit 1
  ;;
esac
