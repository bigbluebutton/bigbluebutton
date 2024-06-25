#!/bin/bash -e

addGroup meteor ""
addUser meteor "" meteor /usr/share/meteor "meteor user-daemon" "/usr/sbin/nologin"

case "$1" in
  install|upgrade|1|2)

    if [ -f /usr/share/meteor/bundle/programs/server/node_modules ]; then
      rm -r /usr/share/meteor/bundle/programs/server/node_modules
    fi

    # Remove remnants from old architecture prior to BBB 3.0.x-alpha.6
    if [ -f /usr/lib/systemd/system/bbb-html5-backend@.service ]; then
      rm /usr/lib/systemd/system/bbb-html5-backend@.service
    fi
    if [ -f /usr/lib/systemd/system/bbb-html5-frontend@.service ]; then
      rm /usr/lib/systemd/system/bbb-html5-frontend@.service
    fi
    if [ -f /etc/nginx/conf.d/bbb-html5-loadbalancer.conf ]; then
      rm /etc/nginx/conf.d/bbb-html5-loadbalancer.conf
    fi
    if [ -f /etc/bigbluebutton/bbb-html5-with-roles.conf ]; then
      echo "BigBlueButton 3.0+ does not support configurations in /etc/bigbluebutton/bbb-html5-with-roles.conf"
    fi

  ;;
esac
