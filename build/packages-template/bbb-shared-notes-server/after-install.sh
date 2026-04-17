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

  if [ ! -f /.dockerenv ]; then


  # This drop-in configures the `bbb-shared-notes-server` system service to support `systemd-run --user` in headless environments.
  # It sets the required `XDG_RUNTIME_DIR` and `DBUS_SESSION_BUS_ADDRESS` environment variables so the Java process
  # can communicate with the per-user systemd instance via D-Bus. Additionally, it declares `Wants=` and `After=`
  # dependencies on `user@UID.service` to ensure the user manager is started before the service attempts to interact with it.
  SERVICE_NAME="bbb-shared-notes-server.service"
  DROPIN_DIR="/etc/systemd/system/${SERVICE_NAME}.d"
  DROPIN_FILE="${DROPIN_DIR}/10-user-session.conf"
  BIGBLUEBUTTON_UID=$(id -u bigbluebutton)

  echo "Creating drop-in for $SERVICE_NAME..."

  if [[ -f "$DROPIN_FILE" ]]; then
      echo "Removing old drop-in for $SERVICE_NAME: $DROPIN_FILE"
      rm $DROPIN_FILE
  fi

  mkdir -p "$DROPIN_DIR"

  tee "$DROPIN_FILE" > /dev/null <<EOF
[Service]
Environment="XDG_RUNTIME_DIR=/run/user/${BIGBLUEBUTTON_UID}"
Environment="DBUS_SESSION_BUS_ADDRESS=unix:path=/run/user/${BIGBLUEBUTTON_UID}/bus"
[Unit]
Wants=user@${BIGBLUEBUTTON_UID}.service
After=user@${BIGBLUEBUTTON_UID}.service
EOF

  echo "Drop-in created sucessfuly: $DROPIN_FILE"
  systemctl daemon-reexec

    systemctl enable bbb-shared-notes-server.service
    systemctl daemon-reload
    reloadService nginx
    startService bbb-shared-notes-server.service || echo "bbb-shared-notes-server service could not be registered or started"
  fi

  echo "Shared-Notes-Server after-install finished"

  ;;

  abort-upgrade|abort-remove|abort-deconfigure)
  ;;

  *)
    echo "postinst called with unknown argument \`$1'" >&2
    exit 1
  ;;
esac
