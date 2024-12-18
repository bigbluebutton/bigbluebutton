#!/bin/bash

cd "$(dirname "$0")"

export LANGUAGE="en_US.UTF-8"
export LC_ALL="en_US.UTF-8"

akka_apps_status=$(sudo systemctl is-active "bbb-apps-akka")
hasura_status=$(sudo systemctl is-active "bbb-graphql-server")

if [ "$akka_apps_status" = "active" ]; then
  echo "Stopping Akka-apps"
  sudo systemctl stop bbb-apps-akka
fi
if [ "$hasura_status" = "active" ]; then
  echo "Stopping Hasura"
  sudo systemctl stop bbb-graphql-server
fi

echo "Restarting database bbb_graphql"
sudo runuser -u postgres -- psql -q -c "drop database if exists bbb_graphql with (force)"
sudo runuser -u postgres -- psql -q -c "create database bbb_graphql WITH TEMPLATE template0 LC_COLLATE 'C.UTF-8'"
sudo runuser -u postgres -- psql -q -c "alter database bbb_graphql set timezone to 'UTC'"

echo "Creating tables in bbb_graphql"
sudo runuser -u postgres -- psql -U postgres -d bbb_graphql -q -f bbb_schema.sql --set ON_ERROR_STOP=on

echo "Creating users"
  # Create user hasura_app@hasura_app (for hasura metadata)
  sudo runuser -u postgres -- psql -tc "SELECT 1 FROM pg_roles WHERE rolname='hasura_app'" | grep -q 1 || \
    sudo runuser -u postgres -- psql -c "CREATE USER hasura_app WITH PASSWORD 'hasura_app'"

  HASURA_DATABASE_NAME="hasura_app"
  sudo runuser -u postgres -- psql -q -c "DROP DATABASE IF EXISTS $HASURA_DATABASE_NAME WITH (FORCE);"
  sudo runuser -u postgres -- psql -q -c "CREATE DATABASE $HASURA_DATABASE_NAME OWNER hasura_app;"

  # Create user bbb_core@bbb_graphql (for akka-apps)
  sudo runuser -u postgres -- psql -tc "SELECT 1 FROM pg_roles WHERE rolname='bbb_core'" | grep -q 1 || \
    sudo runuser -u postgres -- psql -c "CREATE USER bbb_core WITH PASSWORD 'bbb_core'"
  sudo runuser -u postgres -- psql -q -c "GRANT CONNECT ON DATABASE bbb_graphql TO bbb_core"
  sudo runuser -u postgres -- psql -q -d bbb_graphql -c "GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO bbb_core"
  sudo runuser -u postgres -- psql -q -d bbb_graphql -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO bbb_core"
  sudo runuser -u postgres -- psql -q -d bbb_graphql -c "GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO bbb_core"
  sudo runuser -u postgres -- psql -q -d bbb_graphql -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO bbb_core"

  # Create user bbb_hasura@bbb_graphql (for Hasura ReadOnly)
  sudo runuser -u postgres -- psql -tc "SELECT 1 FROM pg_roles WHERE rolname='bbb_hasura'" | grep -q 1 || \
    sudo runuser -u postgres -- psql -c "CREATE USER bbb_hasura WITH PASSWORD 'bbb_hasura'"
  sudo runuser -u postgres -- psql -q -c "GRANT CONNECT ON DATABASE bbb_graphql TO bbb_hasura"
  sudo runuser -u postgres -- psql -q -d bbb_graphql -c "GRANT SELECT ON ALL TABLES IN SCHEMA public TO bbb_hasura"
  sudo runuser -u postgres -- psql -q -d bbb_graphql -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO bbb_hasura"


echo "Starting Hasura"
sudo systemctl start bbb-graphql-server

#Check if Hasura is ready before applying metadata
HASURA_PORT=8085
while ! sudo ss -tuln | grep ":$HASURA_PORT " > /dev/null; do
    echo "Waiting for Hasura's port ($HASURA_PORT) to be ready..."
    sleep 1
done

if [ "$akka_apps_status" = "active" ]; then
  echo "Starting Akka-apps"
  sudo systemctl start bbb-apps-akka
fi

echo "Applying new metadata to Hasura"
timeout 15s sudo hasura metadata apply --skip-update-check
