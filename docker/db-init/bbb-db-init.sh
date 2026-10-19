#!/usr/bin/env bash
# The db-init job, installed as /usr/local/bin/bbb-db-init and started by
# /entrypoint.sh after it validated the environment.
#
# 1. Waits for the postgres service (PGHOST, PGPORT) and connects as the superuser with
#    POSTGRES_PASSWORD. Takes an advisory lock that a separate psql session holds for the rest
#    of the run, so that concurrent runs (a Kubernetes Job retry, `compose run` beside `up`)
#    wait for each other. The session, and with it the lock, ends when this script exits.
# 2. (Re)creates bbb_graphql, hasura_app and blocknote_app (recreate.sql) when the version
#    recorded in the table public.bbb_db_init of the postgres database differs from this
#    image's version, or one of the three databases is missing. Otherwise they are kept: a
#    plain restart changes nothing.
# 3. Sets the role passwords (passwords.sql) after a recreate, or when a role cannot log in
#    with its contract password (e.g. the password was changed in .env).
#
# The image version is written at build time to /usr/share/bbb-db-init/version: the image's
# release version (DOCKER_META_VERSION from docker/metadata-action, `local` without it) and a
# checksum of the SQL the job runs, so a changed schema always counts as a new version.
set -euo pipefail          # never set -x: xtrace prints every value, secrets included
# shellcheck source=docker/lib/entrypoint-lib.sh
source /usr/local/lib/bbb/entrypoint-lib.sh
BBB_LOG_TAG=db-init

SQL_DIR=/usr/share/bbb-db-init
WAIT_SECONDS=60
DATABASES="'bbb_graphql', 'hasura_app', 'blocknote_app'"
# Advisory lock key in the postgres database; any constant only db-init uses.
LOCK_KEY=4245524

version="$(cat "$SQL_DIR/version")"
[ -n "$version" ] || bbb_die "empty image version in $SQL_DIR/version"

# psql as the superuser; the password reaches psql through its environment only.
psql_su() {
    PGPASSWORD="$POSTGRES_PASSWORD" psql -X -w -q -v ON_ERROR_STOP=1 -U postgres "$@"
}

# can_login ROLE DATABASE PASSWORD-VARIABLE
can_login() {
    PGPASSWORD="${!3}" psql -X -w -q -U "$1" -d "$2" -At -c 'SELECT 1' >/dev/null 2>&1
}

bbb_log "waiting for postgres at ${PGHOST:-local socket}:${PGPORT:-5432}"
for ((i = 0; i < WAIT_SECONDS; i++)); do
    pg_isready -q && break
    sleep 1
done
pg_isready -q || bbb_die "postgres not ready after ${WAIT_SECONDS}s"
psql_su -d postgres -At -c 'SELECT 1' >/dev/null

# The lock session reads its commands from this script and keeps running until the script
# exits and its end of the pipe closes. `\! echo locked` reports that the lock is held.
coproc lock_session { psql_su -d postgres -At; }
printf '%s\n' "DO \$\$ BEGIN
    IF NOT pg_try_advisory_lock($LOCK_KEY) THEN
        RAISE NOTICE 'db-init: another db-init run is in progress; waiting for it';
        PERFORM pg_advisory_lock($LOCK_KEY);
    END IF;
END \$\$;" '\! echo locked' >&"${lock_session[1]}"
reply=""
read -r reply <&"${lock_session[0]}" || true
[ "$reply" = locked ] || bbb_die "could not take the db-init lock in the postgres database"

applied=""
if [ "$(psql_su -d postgres -At -c "SELECT to_regclass('public.bbb_db_init') IS NOT NULL")" = t ]; then
    applied="$(psql_su -d postgres -At -c 'SELECT version FROM public.bbb_db_init')"
fi
present="$(psql_su -d postgres -At -c "SELECT count(*) FROM pg_database WHERE datname IN ($DATABASES)")"

recreated=0
if [ "$applied" = "$version" ] && [ "$present" = 3 ]; then
    bbb_log "databases were created by this image version; kept"
else
    bbb_log "image version changed or a database is missing; recreating bbb_graphql, hasura_app, blocknote_app"
    psql_su -d postgres -v bbb_version="$version" -f "$SQL_DIR/recreate.sql"
    recreated=1
fi

if [ "$recreated" = 1 ] \
    || ! can_login hasura_app hasura_app POSTGRES_HASURA_APP_PASSWORD \
    || ! can_login bbb_core bbb_graphql POSTGRES_BBB_CORE_PASSWORD \
    || ! can_login bbb_hasura bbb_graphql POSTGRES_BBB_HASURA_PASSWORD \
    || ! can_login blocknote_app blocknote_app POSTGRES_BLOCKNOTE_PASSWORD; then
    bbb_log "setting role passwords"
    psql_su -d postgres -f "$SQL_DIR/passwords.sql"
else
    bbb_log "role passwords unchanged"
fi
bbb_log "done"
