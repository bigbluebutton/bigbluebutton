#!/bin/bash -e

addGroup meteor ""
addUser meteor "" meteor /usr/share/meteor "meteor user-daemon" "/bin/bash"

case "$1" in
  install|upgrade|1|2)

    if [ -f /usr/share/meteor/bundle/programs/server/assets/app/config/settings.yml ]; then
      cp /usr/share/meteor/bundle/programs/server/assets/app/config/settings.yml /tmp/settings.yml
    fi

    rm -f /tmp/sip.nginx
    if [ -f /etc/bigbluebutton/nginx/sip.nginx ]; then
      cp /etc/bigbluebutton/nginx/sip.nginx /tmp/sip.nginx
    fi

    if [ -f /usr/share/meteor/bundle/programs/server/node_modules ]; then
      rm -r /usr/share/meteor/bundle/programs/server/node_modules
    fi

  ;;
esac
