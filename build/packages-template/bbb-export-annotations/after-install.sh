#!/bin/bash -e

case "$1" in
  configure|upgrade|1|2)

  fc-cache -f

  # Development builds of 4.1 had the override at /etc/bigbluebutton/bbb-export-annotations.json
  # (no release had an override file: 4.0 kept its settings in the config/ of the package)
  OLD_OVERRIDE=/etc/bigbluebutton/bbb-export-annotations.json
  NEW_OVERRIDE=/etc/bigbluebutton/bbb-export-annotations/production.json
  if [ -f $OLD_OVERRIDE ] && [ ! -e $NEW_OVERRIDE ]; then
    mkdir -p $(dirname $NEW_OVERRIDE)
    mv $OLD_OVERRIDE $NEW_OVERRIDE
    echo "Moved $OLD_OVERRIDE to $NEW_OVERRIDE"
  fi

  if [ ! -f /.dockerenv ]; then
    systemctl enable bbb-export-annotations.service
    systemctl daemon-reload
    startService bbb-export-annotations.service || echo "bbb-export-annotations service could not be registered or started"
  fi
  ;;

  abort-upgrade|abort-remove|abort-deconfigure)
  ;;

  *)
    echo "postinst called with unknown argument \`$1'" >&2
    exit 1
  ;;
esac
