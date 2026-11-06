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
# bbb-shared-notes-server create. bbb_graphql and blocknote_app are recreated only when their
# schema in the image changes (the schema's checksum is kept as the comment of the database);
# hasura_app is created once, as graphql-server applies its metadata at every start. The
# passwords are set from .env every time.
q() { psql -v ON_ERROR_STOP=1 -qAt "$@"; }
if ! q -c "SELECT 1" >/dev/null; then
  echo "init: cannot log in to postgres. The postgres volume keeps the POSTGRES_PASSWORD of its first start;" >&2
  echo "init: if .env was written again since, remove the volume with 'docker compose down -v'." >&2
  exit 1
fi
for role in bbb_core bbb_hasura hasura_app blocknote_app; do
  if [ -z "$(q -c "SELECT 1 FROM pg_roles WHERE rolname = '$role'")" ]; then
    q -c "CREATE ROLE $role LOGIN"
  fi
done
q <<SQL
ALTER ROLE bbb_core PASSWORD '$BBB_CORE_PASSWORD';
ALTER ROLE bbb_hasura PASSWORD '$BBB_HASURA_PASSWORD';
ALTER ROLE hasura_app PASSWORD '$HASURA_APP_PASSWORD';
ALTER ROLE blocknote_app PASSWORD '$BLOCKNOTE_PASSWORD';
SQL
# The checksum of schema file $2, if database $1 does not carry it as its comment
changed() {
  sum="$(md5sum "$2" | cut -c1-32)"
  [ "$(q -c "SELECT shobj_description(oid, 'pg_database') FROM pg_database WHERE datname = '$1'")" != "$sum" ]
}

if changed bbb_graphql /schema/graphql/bbb_schema.sql; then
  echo "creating the database bbb_graphql"
  q <<SQL
DROP DATABASE IF EXISTS bbb_graphql WITH (FORCE);
CREATE DATABASE bbb_graphql WITH TEMPLATE template0 LC_COLLATE 'C.UTF-8';
ALTER DATABASE bbb_graphql SET timezone TO 'UTC';
GRANT CONNECT ON DATABASE bbb_graphql TO bbb_core, bbb_hasura;
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
  q -c "COMMENT ON DATABASE bbb_graphql IS '$sum'"
fi

if changed blocknote_app /schema/notes/blocknote_schema.sql; then
  echo "creating the database blocknote_app"
  q -c "DROP DATABASE IF EXISTS blocknote_app WITH (FORCE)"
  q -c "CREATE DATABASE blocknote_app OWNER blocknote_app"
  q -d blocknote_app -f /schema/notes/blocknote_schema.sql
  q -c "COMMENT ON DATABASE blocknote_app IS '$sum'"
fi

if [ -z "$(q -c "SELECT 1 FROM pg_database WHERE datname = 'hasura_app'")" ]; then
  echo "creating the database hasura_app"
  q -c "CREATE DATABASE hasura_app OWNER hasura_app"
fi
