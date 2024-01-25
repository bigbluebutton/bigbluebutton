#!/bin/bash -e

case "$1" in
   remove|purge)
       systemctl daemon-reload
   ;;
   failed-upgrade|abort-upgrade|abort-install|disappear)
   ;;
   *)
       echo "postinst called with unknown argument \`\$1'" >&2
   ;;
esac
