#!/bin/bash -e

case "$1" in
  configure|upgrade|1|2)

  fc-cache -f

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
if [ ! -f /usr/share/bbb-graphql-server/admin-secret.txt ]; then
  mkdir -p /usr/share/bbb-graphql-server
  openssl rand -base64 32 | sed 's/=//g' | sed 's/+//g' | sed 's/\///g' > /usr/share/bbb-graphql-server/admin-secret.txt
  ls -l /usr/share/bbb-graphql-server/
  chmod 644 /usr/share/bbb-graphql-server/admin-secret.txt
  ls -l /usr/share/bbb-graphql-server/
  echo "Set a random password to Hasura at /usr/share/bbb-graphql-server/admin-secret.txt"
fi

#Set admin secret for Hasura CLI
HASURA_ADM_PASSWORD=$(cat /usr/share/bbb-graphql-server/admin-secret.txt)
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


  cat /usr/share/bbb-graphql-server/admin-secret.txt
  cat /usr/share/bbb-graphql-server/config.yaml
  cat /lib/systemd/system/bbb-graphql-server.service
  cat /etc/default/bbb-graphql-server
  sleep 5
  systemctl status bbb-graphql-server.service | tail -n 10
  journalctl -u bbb-graphql-server | tail -n 30

    # Apply BBB metadata in Hasura
    cd /usr/share/bbb-graphql-server
    pwd
    ls -l
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
