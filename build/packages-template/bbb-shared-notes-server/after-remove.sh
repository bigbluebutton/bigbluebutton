#!/bin/bash -e

case "$1" in
  remove|purge|0)
    # Remove sudoers configuration for Docker Chrome
    if [[ -f /etc/sudoers.d/zzz-bbb-docker-chrome ]]; then
      echo "Removing Docker Chrome sudoers configuration..."
      rm -f /etc/sudoers.d/zzz-bbb-docker-chrome
    fi

    echo "Shared-Notes-Server after-remove cleanup finished"
  ;;

  upgrade|failed-upgrade|abort-install|abort-upgrade|disappear)
  ;;

  *)
    echo "postrm called with unknown argument \`$1'" >&2
    exit 1
  ;;
esac
