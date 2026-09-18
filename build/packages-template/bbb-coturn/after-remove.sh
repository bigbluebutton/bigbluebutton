#!/bin/bash -e

case "$1" in
   remove|purge)
       if [ -d /run/systemd/system ]; then
           systemctl daemon-reload
       fi
   ;;
   upgrade|failed-upgrade|abort-upgrade|abort-install|disappear)
   ;;
   *)
       echo "postrm called with unknown argument \`$1'" >&2
       exit 1
   ;;
esac
