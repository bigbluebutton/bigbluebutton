#!/bin/sh
# The databases and roles bbb-graphql-server's install script creates
# (build/packages-template/bbb-graphql-server/after-install.sh).
set -eu
sql() { psql -v ON_ERROR_STOP=1 -q --username "$POSTGRES_USER" "$@"; }
sql -c "create database bbb_graphql WITH TEMPLATE template0 LC_COLLATE 'C.UTF-8'"
sql -c "alter database bbb_graphql set timezone to 'UTC'"
sql -d bbb_graphql -f /docker-entrypoint-initdb.d/bbb_schema.sql.in

# Hasura's metadata
sql -c "CREATE USER hasura_app WITH PASSWORD 'hasura_app'"
sql -c "CREATE DATABASE hasura_app OWNER hasura_app"

# akka-apps writes
sql -c "CREATE USER bbb_core WITH PASSWORD 'bbb_core'"
sql -c "GRANT CONNECT ON DATABASE bbb_graphql TO bbb_core"
sql -d bbb_graphql -c "GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO bbb_core"
sql -d bbb_graphql -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO bbb_core"
sql -d bbb_graphql -c "GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO bbb_core"
sql -d bbb_graphql -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO bbb_core"

# Hasura reads
sql -c "CREATE USER bbb_hasura WITH PASSWORD 'bbb_hasura'"
sql -c "GRANT CONNECT ON DATABASE bbb_graphql TO bbb_hasura"
sql -d bbb_graphql -c "GRANT SELECT ON ALL TABLES IN SCHEMA public TO bbb_hasura"
sql -d bbb_graphql -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO bbb_hasura"
