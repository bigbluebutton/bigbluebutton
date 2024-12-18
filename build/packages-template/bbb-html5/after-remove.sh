#!/bin/bash -e

log() {
  echo "$(date '+%Y-%m-%d %H:%M:%S') - $1"
}

case "$1" in
  remove|failed-upgrade|abort-upgrade|abort-install|disappear|0|1)
    if [ -L /etc/nginx/sites-enabled/bigbluebutton ]; then
      rm /etc/nginx/sites-enabled/bigbluebutton
      log "Removed symbolic link /etc/nginx/sites-enabled/bigbluebutton"
    fi

    if [ -L /usr/share/bigbluebutton/html5-client ]; then
      rm /usr/share/bigbluebutton/html5-client
      log "Removed symbolic link /usr/share/bigbluebutton/html5-client"
    fi

    # legacy location of html5-client circa BBB 3.0.0-beta.1
    if [ -d /var/bigbluebutton/html5-client ]; then
      rm -rf /var/bigbluebutton/html5-client
      log "Removed directory /var/bigbluebutton/html5-client"
    fi

    if [ -d /usr/share/bigbluebutton/html5-client ]; then
      rm -rf /usr/share/bigbluebutton/html5-client
      log "Removed directory /usr/share/bigbluebutton/html5-client"
    fi
  ;;
  upgrade)
    log "Upgrade argument received. No action taken."
  ;;
  *)
    echo "postinst called with unknown argument $1" >&2
    log "Unknown argument: $1"
  ;;
esac
