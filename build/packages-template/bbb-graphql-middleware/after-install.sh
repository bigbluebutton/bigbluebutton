#!/bin/bash -e

case "$1" in
  configure|upgrade|1|2)

  fc-cache -f

  systemctl daemon-reload
  startService bbb-graphql-middleware || echo "bbb-graphql-middleware service could not be registered or started"
  # If a symlink doesn't exist and can be created, then create it.
  if [ ! -e /etc/nginx/sites-enabled/hasura-loadbalancer.conf ] && \
    [ -d /etc/nginx/sites-enabled ] && [ -d /etc/nginx/sites-available ]; then
      ln -s /etc/nginx/sites-available/hasura-loadbalancer.conf /etc/nginx/sites-enabled/hasura-loadbalancer.conf
  fi

  reloadService nginx
  ;;

  abort-upgrade|abort-remove|abort-deconfigure)
  ;;

  *)
    echo "postinst called with unknown argument \`$1'" >&2
    exit 1
  ;;
esac
