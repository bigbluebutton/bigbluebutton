#!/bin/bash -e

case "$1" in
  configure|upgrade|1|2)

  fc-cache -f

  sudo -u postgres psql -c "alter user postgres password 'bbb_graphql'"
  sudo -u postgres psql -c "drop database if exists bbb_graphql"
  sudo -u postgres psql -c "create database bbb_graphql"
  sudo -u postgres psql -c "alter database bbb_graphql set timezone to 'UTC'"

  DATABASE_NAME="hasura_app"
  DB_EXISTS=$(sudo -u postgres psql -U postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$DATABASE_NAME'")
  if [ "$DB_EXISTS" = '1' ]
  then
      echo "Database $DATABASE_NAME already exists"
  else
      sudo -u postgres psql -c "create database hasura_app"
      echo "Database $DATABASE_NAME created"
  fi

  sudo -u postgres psql -U postgres -d bbb_graphql -a -f /usr/share/bbb-graphql-server/bbb_schema.sql --set ON_ERROR_STOP=on
  sudo -u postgres psql -c "drop database if exists hasura_app"

  sudo -u postgres psql -c "create database hasura_app"
  echo "Postgresql configured"

  systemctl daemon-reload
  startService bbb-graphql-server || echo "bbb-graphql-server service could not be registered or started"

  # Apply BBB metadata in Hasura
  cd /usr/share/bbb-graphql-server
  /usr/local/bin/hasura/hasura metadata apply
  cd ..
  rm -rf /usr/share/bbb-graphql-server/metadata
  ;;

  abort-upgrade|abort-remove|abort-deconfigure)
  ;;

  *)
    echo "postinst called with unknown argument \`$1'" >&2
    exit 1
  ;;
esac
