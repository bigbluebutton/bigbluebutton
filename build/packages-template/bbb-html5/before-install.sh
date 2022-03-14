#!/bin/bash -e

addGroup meteor ""
addUser meteor "" meteor /usr/share/meteor "meteor user-daemon" "/usr/sbin/nologin"

case "$1" in
  install|upgrade|1|2)

    rm -f /tmp/sip.nginx
    if [ -f /etc/bigbluebutton/nginx/sip.nginx ]; then
      cp /etc/bigbluebutton/nginx/sip.nginx /tmp/sip.nginx
    fi

    if [ -f /usr/share/meteor/bundle/programs/server/node_modules ]; then
      rm -r /usr/share/meteor/bundle/programs/server/node_modules
    fi

  ;;
esac
