#!/bin/bash -e

case "$1" in
  configure|upgrade|1|2)

  fc-cache -f

  # make sure postgres can read this directory
  chmod 755 /usr/share/bbb-shared-notes-server/ -R


  # Create user blocknote_app@blocknote_app (for blocknote metadata)
  runuser -u postgres -- psql -tc "SELECT 1 FROM pg_roles WHERE rolname='blocknote_app'" | grep -q 1 || \
    runuser -u postgres -- psql -c "CREATE USER blocknote_app WITH PASSWORD 'blocknote_app'"

  BLOCKNOTE_DATABASE_NAME="blocknote_app"
  runuser -u postgres -- psql -q -c "DROP DATABASE IF EXISTS $BLOCKNOTE_DATABASE_NAME WITH (FORCE);"
  runuser -u postgres -- psql -q -c "CREATE DATABASE $BLOCKNOTE_DATABASE_NAME OWNER blocknote_app;"

runuser -u postgres -- psql -U postgres -d blocknote_app -q -f /usr/share/bbb-shared-notes-server/blocknote_schema.sql --set ON_ERROR_STOP=on


  # PDF conversion no longer goes through `systemd-run --user`: drop the user session
  # drop-in that earlier versions installed for it.
  DROPIN_DIR="/etc/systemd/system/bbb-shared-notes-server.service.d"
  rm -f "$DROPIN_DIR/10-user-session.conf"
  rmdir --ignore-fail-on-non-empty "$DROPIN_DIR" 2>/dev/null || true
  systemctl daemon-reload

  if [ ! -f /.dockerenv ]; then
    systemctl enable bbb-shared-notes-server.service
    systemctl daemon-reload
    reloadService nginx
  fi

  startService bbb-shared-notes-conversion.socket || echo "bbb-shared-notes-conversion socket could not be registered or started"
  startService bbb-shared-notes-server.service || echo "bbb-shared-notes-server service could not be registered or started"

  echo "Shared-Notes-Server after-install finished"

  ;;

  abort-upgrade|abort-remove|abort-deconfigure)
  ;;

  *)
    echo "postinst called with unknown argument \`$1'" >&2
    exit 1
  ;;
esac
