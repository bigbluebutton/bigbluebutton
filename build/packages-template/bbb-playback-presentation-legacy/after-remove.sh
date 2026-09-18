#!/bin/bash -e

case "$1" in
  remove)

    reloadService nginx

  ;;

  purge|upgrade|failed-upgrade|abort-upgrade|abort-install|disappear)
  ;;

  *)
    echo "postrm called with unknown argument \`$1'" >&2
    exit 1
  ;;
esac
