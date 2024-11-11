#!/bin/bash -e

case "$1" in
  configure|upgrade|1|2)

  fc-cache -f

  # make sure postgres can read this directory
  chmod 755 /usr/share/bbb-graphql-server/ -R

  runuser -u postgres -- psql -q -c "drop database if exists bbb_graphql with (force)"
  runuser -u postgres -- psql -c "create database bbb_graphql WITH TEMPLATE template0 LC_COLLATE 'C.UTF-8'"
  runuser -u postgres -- psql -q -c "alter database bbb_graphql set timezone to 'UTC'"
  runuser -u postgres -- psql -U postgres -d bbb_graphql -q -f /usr/share/bbb-graphql-server/bbb_schema.sql --set ON_ERROR_STOP=on

  # Create user hasura_app@hasura_app (for hasura metadata)
  runuser -u postgres -- psql -tc "SELECT 1 FROM pg_roles WHERE rolname='hasura_app'" | grep -q 1 || \
    runuser -u postgres -- psql -c "CREATE USER hasura_app WITH PASSWORD 'hasura_app'"

  HASURA_DATABASE_NAME="hasura_app"
  runuser -u postgres -- psql -q -c "DROP DATABASE IF EXISTS $HASURA_DATABASE_NAME WITH (FORCE);"
  runuser -u postgres -- psql -q -c "CREATE DATABASE $HASURA_DATABASE_NAME OWNER hasura_app;"

  # Create user bbb_core@bbb_graphql (for akka-apps)
  runuser -u postgres -- psql -tc "SELECT 1 FROM pg_roles WHERE rolname='bbb_core'" | grep -q 1 || \
    runuser -u postgres -- psql -c "CREATE USER bbb_core WITH PASSWORD 'bbb_core'"
  runuser -u postgres -- psql -q -c "GRANT CONNECT ON DATABASE bbb_graphql TO bbb_core"
  runuser -u postgres -- psql -q -d bbb_graphql -c "GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO bbb_core"
  runuser -u postgres -- psql -q -d bbb_graphql -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO bbb_core"
  runuser -u postgres -- psql -q -d bbb_graphql -c "GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO bbb_core"
  runuser -u postgres -- psql -q -d bbb_graphql -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO bbb_core"

  # Create user bbb_hasura@bbb_graphql (for Hasura ReadOnly)
  runuser -u postgres -- psql -tc "SELECT 1 FROM pg_roles WHERE rolname='bbb_hasura'" | grep -q 1 || \
    runuser -u postgres -- psql -c "CREATE USER bbb_hasura WITH PASSWORD 'bbb_hasura'"
  runuser -u postgres -- psql -q -c "GRANT CONNECT ON DATABASE bbb_graphql TO bbb_hasura"
  runuser -u postgres -- psql -q -d bbb_graphql -c "GRANT SELECT ON ALL TABLES IN SCHEMA public TO bbb_hasura"
  runuser -u postgres -- psql -q -d bbb_graphql -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO bbb_hasura"


  echo "Postgresql configured"

  #Generate a random password to Hasura to improve security
  if [ ! -f /etc/default/bbb-graphql-server-admin-pass ]; then
    HASURA_RANDOM_ADM_PASSWORD=$(openssl rand -base64 32 | sed 's/=//g' | sed 's/+//g' | sed 's/\///g')
    echo "# This password is randomly generated during the installation of BigBlueButton." > /etc/default/bbb-graphql-server-admin-pass
    echo "# It serves as the admin password for the bbb-graphql-server (Hasura)." >> /etc/default/bbb-graphql-server-admin-pass
    echo "# The admin can change this password at any time. Only a restart of BigBlueButton is required." >> /etc/default/bbb-graphql-server-admin-pass
    echo "HASURA_GRAPHQL_ADMIN_SECRET=$HASURA_RANDOM_ADM_PASSWORD" >> /etc/default/bbb-graphql-server-admin-pass
    chown root:root /etc/default/bbb-graphql-server-admin-pass
    chmod 600 /etc/default/bbb-graphql-server-admin-pass
    echo "Set a random password to Hasura at /etc/default/bbb-graphql-server-admin-pass"
  fi

  #Set admin secret for Hasura CLI
  HASURA_ADM_PASSWORD=$(grep '^HASURA_GRAPHQL_ADMIN_SECRET=' /etc/default/bbb-graphql-server-admin-pass | cut -d '=' -f 2)
  sed -i "s/^admin_secret: .*/admin_secret: $HASURA_ADM_PASSWORD/g" /usr/share/bbb-graphql-server/config.yaml

  if [ ! -f /.dockerenv ]; then
    systemctl enable bbb-graphql-server.service
    systemctl daemon-reload
    restartService bbb-graphql-server || echo "bbb-graphql-server service could not be registered or started"

    #Check if Hasura is ready before applying metadata
    HASURA_PORT=8085
    while ! ss -tuln | grep ":$HASURA_PORT " > /dev/null; do
        echo "Waiting for Hasura's port ($HASURA_PORT) to be ready..."
        sleep 1
    done

    # Apply BBB metadata in Hasura
    cd /usr/share/bbb-graphql-server
    timeout 15s /usr/bin/hasura metadata apply --skip-update-check
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
