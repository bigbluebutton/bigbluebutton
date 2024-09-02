#!/bin/bash -e

case "$1" in
  configure|upgrade|1|2)

  fc-cache -f

  # make sure postgres can read this directory
  chmod 755 /usr/share/bbb-graphql-server/ -R

  runuser -u postgres -- psql -c "alter user postgres password 'bbb_graphql'"
  runuser -u postgres -- psql -c "drop database if exists bbb_graphql with (force)"
  runuser -u postgres -- psql -c "create database bbb_graphql WITH TEMPLATE template0 LC_COLLATE 'C.UTF-8'"
  runuser -u postgres -- psql -c "alter database bbb_graphql set timezone to 'UTC'"
  runuser -u postgres -- psql -U postgres -d bbb_graphql -q -f /usr/share/bbb-graphql-server/bbb_schema.sql --set ON_ERROR_STOP=on

  DATABASE_NAME="hasura_app"
  DB_EXISTS=$(runuser -u postgres -- psql -U postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$DATABASE_NAME'")
  if [ "$DB_EXISTS" = '1' ]
  then
      echo "Database $DATABASE_NAME already exists"
  else
      runuser -u postgres -- psql -c "create database hasura_app"
      echo "Database $DATABASE_NAME created"
  fi

  echo "Postgresql configured"

  #Generate a random password to Hasura to improve security
  if [ ! -f /usr/share/bbb-graphql-server/admin-secret ]; then
    HASURA_RANDOM_ADM_PASSWORD=$(openssl rand -base64 32 | sed 's/=//g' | sed 's/+//g' | sed 's/\///g')
    echo "HASURA_GRAPHQL_ADMIN_SECRET=$HASURA_RANDOM_ADM_PASSWORD" > /usr/share/bbb-graphql-server/admin-secret
    chmod 755 /usr/share/bbb-graphql-server/admin-secret
    echo "Set a random password to Hasura at /usr/share/bbb-graphql-server/admin-secret"
  fi

  #Set admin secret for Hasura CLI
  HASURA_ADM_PASSWORD=$(grep '^HASURA_GRAPHQL_ADMIN_SECRET=' /usr/share/bbb-graphql-server/admin-secret | cut -d '=' -f 2)
  sed -i "s/^admin_secret: .*/admin_secret: $HASURA_ADM_PASSWORD/g" /usr/share/bbb-graphql-server/config.yaml

  if [ ! -f /.dockerenv ]; then
    systemctl enable bbb-graphql-server.service
    systemctl daemon-reload
    restartService bbb-graphql-server || echo "bbb-graphql-server service could not be registered or started"

    #Check if Hasura is ready before applying metadata
    HASURA_PORT=8085
    while ! netstat -tuln | grep ":$HASURA_PORT " > /dev/null; do
        echo "Waiting for Hasura's port ($HASURA_PORT) to be ready..."
        sleep 1
    done

    # Apply BBB metadata in Hasura
    cd /usr/share/bbb-graphql-server
    timeout 15s /usr/local/bin/hasura metadata apply --skip-update-check
    cd ..
    rm -rf /usr/share/bbb-graphql-server/metadata
  fi

  echo "Graphql-server after-install finished"

  ;;

  abort-upgrade|abort-remove|abort-deconfigure)
  ;;

  *)
    echo "postinst called with unknown argument \`$1'" >&2
    exit 1
  ;;
esac
