#!/bin/bash -e

case "$1" in
   remove|failed-upgrade|abort-upgrade|abort-install|disappear)
   ;;
   purge)
     deleteUser etherpad
     deleteGroup etherpad
     rm -f /usr/share/bigbluebutton/nginx/notes.nginx
   ;;
   upgrade)
   ;;
   *)
      echo "postinst called with unknown argument \`\$1'" >&2
   ;;
esac
