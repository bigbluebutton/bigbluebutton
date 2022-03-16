#!/bin/bash -e

addGroup meteor ""
addUser meteor "" meteor /usr/share/meteor "meteor user-daemon" "/usr/sbin/nologin"

case "$1" in
  install|upgrade|1|2)

    if [ -f /usr/share/meteor/bundle/programs/server/node_modules ]; then
      rm -r /usr/share/meteor/bundle/programs/server/node_modules
    fi

  ;;
esac
