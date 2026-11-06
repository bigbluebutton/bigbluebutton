#!/bin/bash -e

case "$1" in
  remove)

    # A failing reload must not abort the removal and leave the package
    # half-installed, so skip it when the nginx configuration is not valid.
    if nginx -t >/dev/null 2>&1; then
      reloadService nginx || true
    fi

  ;;

  purge|upgrade|failed-upgrade|abort-upgrade|abort-install|disappear)
  ;;

  *)
    echo "postrm called with unknown argument \`$1'" >&2
    exit 1
  ;;
esac
