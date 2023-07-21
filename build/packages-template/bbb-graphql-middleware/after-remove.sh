#!/bin/bash -e

case "$1" in
   remove|failed-upgrade|abort-upgrade|abort-install|disappear|0|1)

   ;;
   purge)
     # remove
     rm -rf /usr/local/bin/bbb-graphql-middleware
     rm -rf /usr/share/bbb-graphql-middleware
   ;;
   upgrade)
   ;;
   *)
      echo "postinst called with unknown argument $1" >&2
   ;;
esac
