#!/bin/sh
set -eu
# The data directories that the packages create (bbb-web, bbb-config, bbb-record-core,
# bbb-playback-*, bbb-webrtc-recorder), owned by bigbluebutton. Only these directories are
# chowned, not what is in them.
cd /var/bigbluebutton
set -- . diagnostics basic_stats captions captions/inbox deleted events unpublished published \
  recording recording/raw recording/process recording/publish recording/status
for s in ended recorded archived processed sanity published; do set -- "$@" "recording/status/$s"; done
for f in presentation video notes screenshare; do
  set -- "$@" "published/$f" "recording/publish/$f" "/var/log/bigbluebutton/$f"
done
mkdir -p "$@" /var/lib/bbb-webrtc-recorder
chown 998:998 "$@" /var/log/bigbluebutton /var/lib/bbb-webrtc-recorder
chmod 0700 /var/lib/bbb-webrtc-recorder

# The databases and roles that the after-install.sh of bbb-graphql-server and
# bbb-shared-notes-server create. Like a package upgrade, it recreates them when the schemas in
# the images change; otherwise it only sets the passwords from .env.
# The checksum of both schemas is kept as the comment of the database bbb_graphql.
q() { psql -v ON_ERROR_STOP=1 -qAt "$@"; }
if ! q -c "SELECT 1" >/dev/null; then
  echo "init: cannot log in to postgres. The postgres volume keeps the POSTGRES_PASSWORD of its first start;" >&2
  echo "init: if .env was written again since, remove the volume with 'docker compose down -v'." >&2
  exit 1
fi
sum="$(cat /schema/graphql/bbb_schema.sql /schema/notes/blocknote_schema.sql | md5sum | cut -c1-32)"
if [ "$(q -c "SELECT shobj_description(oid, 'pg_database') FROM pg_database WHERE datname = 'bbb_graphql'")" != "$sum" ]; then
  echo "creating the databases"
  q <<SQL
DROP DATABASE IF EXISTS bbb_graphql WITH (FORCE);
DROP DATABASE IF EXISTS hasura_app WITH (FORCE);
DROP DATABASE IF EXISTS blocknote_app WITH (FORCE);
DROP ROLE IF EXISTS bbb_core, bbb_hasura, hasura_app, blocknote_app;
CREATE ROLE bbb_core LOGIN;
CREATE ROLE bbb_hasura LOGIN;
CREATE ROLE hasura_app LOGIN;
CREATE ROLE blocknote_app LOGIN;
CREATE DATABASE bbb_graphql WITH TEMPLATE template0 LC_COLLATE 'C.UTF-8';
ALTER DATABASE bbb_graphql SET timezone TO 'UTC';
GRANT CONNECT ON DATABASE bbb_graphql TO bbb_core, bbb_hasura;
CREATE DATABASE hasura_app OWNER hasura_app;
CREATE DATABASE blocknote_app OWNER blocknote_app;
SQL
  q -d bbb_graphql -f /schema/graphql/bbb_schema.sql
  q -d bbb_graphql <<SQL
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO bbb_core;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO bbb_core;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO bbb_core;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO bbb_core;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO bbb_hasura;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO bbb_hasura;
SQL
  q -d blocknote_app -f /schema/notes/blocknote_schema.sql
  q -c "COMMENT ON DATABASE bbb_graphql IS '$sum'"
fi
q <<SQL
ALTER ROLE bbb_core PASSWORD '$BBB_CORE_PASSWORD';
ALTER ROLE bbb_hasura PASSWORD '$BBB_HASURA_PASSWORD';
ALTER ROLE hasura_app PASSWORD '$HASURA_APP_PASSWORD';
ALTER ROLE blocknote_app PASSWORD '$BLOCKNOTE_PASSWORD';
SQL
