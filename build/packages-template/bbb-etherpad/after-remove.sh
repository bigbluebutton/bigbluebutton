#!/bin/bash -e

case "$1" in
   remove|failed-upgrade|abort-upgrade|abort-install|disappear)
   ;;
   purge)
     deleteUser etherpad
     deleteGroup etherpad
   ;;
   upgrade)
   ;;
   *)
      echo "postinst called with unknown argument \`\$1'" >&2
   ;;
esac
