#!/bin/bash

cd "$(dirname "$0")"

export LANGUAGE="en_US.UTF-8"
export LC_ALL="en_US.UTF-8"

# Dropping and recreating bbb_graphql wipes all live meeting state and takes
# much longer than a metadata apply. Skip it when bbb_schema.sql is unchanged
# since it was last loaded, or explicitly:
#   --metadata-only   never touch the database, only apply Hasura metadata
#   --force-db        drop and recreate the database even if unchanged
# The hash of the loaded schema is kept as a comment on the bbb_graphql
# database itself, written only after the schema loaded successfully. Anything
# else that recreates the database (e.g. the package's after-install.sh) leaves
# no comment, so the next run here recreates it from this bbb_schema.sql.
SCHEMA_COMMENT_PREFIX="bbb_schema.sql md5 "
MODE=auto
for var in "$@"
do
    case $var in
        --metadata-only) MODE=metadata ;;
        --force-db) MODE=db ;;
        *) echo "Usage: $0 [--metadata-only|--force-db]" >&2; exit 1 ;;
    esac
done

current_schema_hash=$(md5sum bbb_schema.sql | cut -d' ' -f1)
if [ "$MODE" = "auto" ]; then
    stored_schema_comment=$(sudo -i -u postgres -- psql -tAq -c "SELECT shobj_description(oid, 'pg_database') FROM pg_database WHERE datname = 'bbb_graphql'" 2>/dev/null || true)
    if [ "$stored_schema_comment" = "${SCHEMA_COMMENT_PREFIX}${current_schema_hash}" ]; then
        echo "bbb_schema.sql unchanged since last deploy, applying metadata only (--force-db overrides)"
        MODE=metadata
    else
        MODE=db
    fi
fi

akka_apps_status=$(sudo systemctl is-active "bbb-apps-akka")
hasura_status=$(sudo systemctl is-active "bbb-graphql-server")

if [ "$MODE" = "db" ]; then
    if [ "$akka_apps_status" = "active" ]; then
      echo "Stopping Akka-apps"
      sudo systemctl stop bbb-apps-akka
    fi
    if [ "$hasura_status" = "active" ]; then
      echo "Stopping Hasura"
      sudo systemctl stop bbb-graphql-server
    fi

    echo "Restarting database bbb_graphql"
    sudo -i -u postgres -- psql -q -c "drop database if exists bbb_graphql with (force)"
    sudo -i -u postgres -- psql -q -c "create database bbb_graphql WITH TEMPLATE template0 LC_COLLATE 'C.UTF-8'"
    sudo -i -u postgres -- psql -q -c "alter database bbb_graphql set timezone to 'UTC'"

    echo "Creating tables in bbb_graphql"
    sudo cp bbb_schema.sql /tmp/
    if sudo -i -u postgres -- psql -U postgres -d bbb_graphql -q -f "/tmp/bbb_schema.sql" --set ON_ERROR_STOP=on; then
      schema_loaded=1
    else
      schema_loaded=0
      echo "ERROR: loading bbb_schema.sql failed; the next run will recreate the database again" >&2
    fi

    echo "Creating users"
      # Create user hasura_app@hasura_app (for hasura metadata)
      sudo -i -u postgres -- psql -tc "SELECT 1 FROM pg_roles WHERE rolname='hasura_app'" | grep -q 1 || \
        sudo -i -u postgres -- psql -c "CREATE USER hasura_app WITH PASSWORD 'hasura_app'"

      HASURA_DATABASE_NAME="hasura_app"
      sudo -i -u postgres -- psql -q -c "DROP DATABASE IF EXISTS $HASURA_DATABASE_NAME WITH (FORCE);"
      sudo -i -u postgres -- psql -q -c "CREATE DATABASE $HASURA_DATABASE_NAME OWNER hasura_app;"

      # Create user bbb_core@bbb_graphql (for akka-apps)
      sudo -i -u postgres -- psql -tc "SELECT 1 FROM pg_roles WHERE rolname='bbb_core'" | grep -q 1 || \
        sudo -i -u postgres -- psql -c "CREATE USER bbb_core WITH PASSWORD 'bbb_core'"
      sudo -i -u postgres -- psql -q -c "GRANT CONNECT ON DATABASE bbb_graphql TO bbb_core"
      sudo -i -u postgres -- psql -q -d bbb_graphql -c "GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO bbb_core"
      sudo -i -u postgres -- psql -q -d bbb_graphql -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO bbb_core"
      sudo -i -u postgres -- psql -q -d bbb_graphql -c "GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO bbb_core"
      sudo -i -u postgres -- psql -q -d bbb_graphql -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO bbb_core"

      # Create user bbb_hasura@bbb_graphql (for Hasura ReadOnly)
      sudo -i -u postgres -- psql -tc "SELECT 1 FROM pg_roles WHERE rolname='bbb_hasura'" | grep -q 1 || \
        sudo -i -u postgres -- psql -c "CREATE USER bbb_hasura WITH PASSWORD 'bbb_hasura'"
      sudo -i -u postgres -- psql -q -c "GRANT CONNECT ON DATABASE bbb_graphql TO bbb_hasura"
      sudo -i -u postgres -- psql -q -d bbb_graphql -c "GRANT SELECT ON ALL TABLES IN SCHEMA public TO bbb_hasura"
      sudo -i -u postgres -- psql -q -d bbb_graphql -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO bbb_hasura"

    if [ "$schema_loaded" = 1 ]; then
      sudo -i -u postgres -- psql -q -c "COMMENT ON DATABASE bbb_graphql IS '${SCHEMA_COMMENT_PREFIX}${current_schema_hash}'"
    fi
fi

if [ "$(sudo systemctl is-active bbb-graphql-server)" != "active" ]; then
    echo "Starting Hasura"
    sudo systemctl start bbb-graphql-server
fi

#Check if Hasura is ready before applying metadata
HASURA_PORT=8085
while ! sudo ss -tuln | grep ":$HASURA_PORT " > /dev/null; do
    echo "Waiting for Hasura's port ($HASURA_PORT) to be ready..."
    sleep 1
done

if [ "$MODE" = "db" ] && [ "$akka_apps_status" = "active" ]; then
  echo "Starting Akka-apps"
  sudo systemctl start bbb-apps-akka
fi

echo "Applying new metadata to Hasura"
source <(sudo cat /etc/default/bbb-graphql-server-admin-pass)
timeout 15s sudo hasura metadata apply --skip-update-check --admin-secret "$HASURA_GRAPHQL_ADMIN_SECRET"

if [ "$MODE" = "metadata" ]; then
  echo "Note: Hasura closes every client connection when metadata changes; connected clients reconnect and get the new permissions."
fi
