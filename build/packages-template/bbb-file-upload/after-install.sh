#!/bin/bash -e

case "$1" in
  configure|upgrade|1|2)

  chmod 755 /usr/share/bbb-file-upload/ -R

  if [[ ! -f /.dockerenv ]]; then
    systemctl enable bbb-file-upload.service
    systemctl daemon-reload
    reloadService nginx
  fi

  startService bbb-file-upload.service || echo "bbb-file-upload service could not be registered or started"

  echo "File-Upload after-install finished"

  ;;

  abort-upgrade|abort-remove|abort-deconfigure)
  ;;

  *)
    echo "postinst called with unknown argument \`$1'" >&2
    exit 1
  ;;
esac
