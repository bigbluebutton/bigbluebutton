#!/bin/bash -e

case "$1" in
  configure|upgrade|1|2)

  fc-cache -f

  sudo -u postgres psql -c "alter user postgres password 'bbb_graphql'"
  sudo -u postgres psql -c "drop database if exists bbb_graphql with (force)"
  sudo -u postgres psql -c "create database bbb_graphql WITH TEMPLATE template0 LC_COLLATE 'C.UTF-8'"
  sudo -u postgres psql -c "alter database bbb_graphql set timezone to 'UTC'"
  sudo -u postgres psql -U postgres -d bbb_graphql -q -f /usr/share/bbb-graphql-server/bbb_schema.sql --set ON_ERROR_STOP=on

  DATABASE_NAME="hasura_app"
  DB_EXISTS=$(sudo -u postgres psql -U postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$DATABASE_NAME'")
  if [ "$DB_EXISTS" = '1' ]
  then
      echo "Database $DATABASE_NAME already exists"
  else
      sudo -u postgres psql -c "create database hasura_app"
      echo "Database $DATABASE_NAME created"
  fi

  echo "Postgresql configured"

  if [ ! -f /.dockerenv ]; then
    systemctl enable bbb-graphql-server.service
    systemctl daemon-reload
    startService bbb-graphql-server || echo "bbb-graphql-server service could not be registered or started"

    #Check if Hasura is ready before applying metadata
    HASURA_PORT=8080
    while ! netstat -tuln | grep ":$HASURA_PORT " > /dev/null; do
        echo "Waiting for Hasura's port ($HASURA_PORT) to be ready..."
        sleep 1
    done

    # Apply BBB metadata in Hasura
    cd /usr/share/bbb-graphql-server
    /usr/local/bin/hasura metadata apply --skip-update-check
    cd ..
    rm -rf /usr/share/bbb-graphql-server/metadata
  fi

  ;;

  abort-upgrade|abort-remove|abort-deconfigure)
  ;;

  *)
    echo "postinst called with unknown argument \`$1'" >&2
    exit 1
  ;;
esac
