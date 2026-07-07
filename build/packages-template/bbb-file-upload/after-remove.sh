#!/bin/bash -e

case "$1" in
  remove|purge|0)
    echo "File-Upload after-remove cleanup finished"
  ;;

  upgrade|failed-upgrade|abort-install|abort-upgrade|disappear)
  ;;

  *)
    echo "postrm called with unknown argument \`$1'" >&2
    exit 1
  ;;
esac
