#!/bin/bash -e

case "$1" in
   remove|failed-upgrade|abort-upgrade|abort-install|disappear|0|1)

   ;;
   purge)
     rm  /usr/local/bin/hasura # legacy location
     rm  /usr/bin/hasura
     rm -rf /usr/local/bin/hasura-graphql-engine # legacy location
     rm -rf /usr/bin/hasura-graphql-engine
     rm -rf /usr/share/bbb-graphql-server
   ;;
   upgrade)
   ;;
   *)
      echo "postinst called with unknown argument $1" >&2
   ;;
esac

