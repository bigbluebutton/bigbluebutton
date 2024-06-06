#!/bin/bash -e

# Deleting user: bigbluebutton and group: bigbluebutton
case "$1" in
   remove|failed-upgrade|abort-upgrade|abort-install|disappear|0)
   ;;
   purge)
        deleteUser freeswitch
   ;;
   upgrade)
   ;;
   *)
      echo "postrm called with unknown argument \`\$1'" >&2
   ;;
esac
