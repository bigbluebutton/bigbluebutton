#!/bin/bash -e

case "$1" in
   remove|failed-upgrade|abort-upgrade|abort-install|disappear|0|1)

   ;;
   purge)
     # remove Hasura
     rm -rf /usr/local/bin/hasura
   ;;
   upgrade)
   ;;
   *)
      echo "postinst called with unknown argument $1" >&2
   ;;
esac

