#!/bin/bash -e

case "$1" in
   remove|failed-upgrade|abort-upgrade|abort-install|disappear)
   ;;
   purge)
      # remove file deployed by after-install script if it is still a symlink
      if [ "x$(readlink -f /etc/bigbluebutton/nginx/include_default.nginx)" = x/usr/share/bigbluebutton/include_default.nginx ] ; then
        rm /etc/bigbluebutton/nginx/include_default.nginx
      fi
   ;;
   upgrade)
   ;;
   *)
      echo "postinst called with unknown argument \`\$1'" >&2
   ;;
esac
