#!/bin/bash

set -e
set -u

function create_user_and_database() {
	local database=$1
	echo "  Creating user and database '$database'"
	psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
	    CREATE DATABASE $database;
	    GRANT ALL PRIVILEGES ON DATABASE $database TO $POSTGRES_USER;
EOSQL
}

echo "Restarting database bbb_graphql"
psql -q -c "drop database if exists bbb_graphql with (force)"
psql -q -c "create database bbb_graphql WITH TEMPLATE template0 LC_COLLATE 'C.UTF-8'"
psql -q -c "alter database bbb_graphql set timezone to 'UTC'"

echo "Creating tables in bbb_graphql"
psql -U postgres -d bbb_graphql -q -f "/bbb-graphql-server/bbb_schema.sql" --set ON_ERROR_STOP=on

echo "Creating users"
# Create user hasura_app@hasura_app (for hasura metadata)
psql -tc "SELECT 1 FROM pg_roles WHERE rolname='hasura_app'" | grep -q 1 || \
psql -c "CREATE USER hasura_app WITH PASSWORD '$POSTGRES_HASURA_APP_PASSWORD'"

HASURA_DATABASE_NAME="hasura_app"
psql -q -c "DROP DATABASE IF EXISTS $HASURA_DATABASE_NAME WITH (FORCE);"
psql -q -c "CREATE DATABASE $HASURA_DATABASE_NAME OWNER hasura_app;"

# Create user bbb_core@bbb_graphql (for akka-apps)
psql -tc "SELECT 1 FROM pg_roles WHERE rolname='bbb_core'" | grep -q 1 || \
psql -c "CREATE USER bbb_core WITH PASSWORD '$POSTGRES_BBB_CORE_PASSWORD'"
psql -q -c "GRANT CONNECT ON DATABASE bbb_graphql TO bbb_core"
psql -q -d bbb_graphql -c "GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO bbb_core"
psql -q -d bbb_graphql -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO bbb_core"
psql -q -d bbb_graphql -c "GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO bbb_core"
psql -q -d bbb_graphql -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO bbb_core"

# Create user bbb_hasura@bbb_graphql (for Hasura ReadOnly)
psql -tc "SELECT 1 FROM pg_roles WHERE rolname='bbb_hasura'" | grep -q 1 || \
psql -c "CREATE USER bbb_hasura WITH PASSWORD '$POSTGRES_BBB_HASURA_PASSWORD'"
psql -q -c "GRANT CONNECT ON DATABASE bbb_graphql TO bbb_hasura"
psql -q -d bbb_graphql -c "GRANT SELECT ON ALL TABLES IN SCHEMA public TO bbb_hasura"
psql -q -d bbb_graphql -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO bbb_hasura"