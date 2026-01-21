#!/bin/bash -e

case "$1" in
  configure|upgrade|1|2)

  # Create SQLite database directory with proper permissions
  mkdir -p /var/lib/bbb-shared-notes-server
  chown bigbluebutton:bigbluebutton /var/lib/bbb-shared-notes-server
  chmod 755 /var/lib/bbb-shared-notes-server

  fc-cache -f
  if [ ! -f /.dockerenv ]; then
    systemctl enable bbb-shared-notes-server.service
    systemctl daemon-reload
    startService bbb-shared-notes-server.service || echo "bbb-shared-notes-server service could not be registered or started"
  fi
  ;;

  abort-upgrade|abort-remove|abort-deconfigure)
  ;;

  *)
    echo "postinst called with unknown argument \`$1'" >&2
    exit 1
  ;;
esac
