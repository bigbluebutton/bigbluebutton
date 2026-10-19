#!/usr/bin/env bash
# db-init: run-only job that creates the BigBlueButton databases and roles in the postgres
# service. The job itself is bbb-db-init; this entrypoint validates its environment.
set -euo pipefail          # never set -x: xtrace prints every value, secrets included
# shellcheck source=docker/lib/entrypoint-lib.sh
source /usr/local/lib/bbb/entrypoint-lib.sh
BBB_LOG_TAG=db-init

bbb_init "$@"
set -- "${BBB_ARGS[@]}"
[ "$#" -gt 0 ] || set -- /usr/local/bin/bbb-db-init

# 1. validate
PASSWORDS=(POSTGRES_PASSWORD POSTGRES_BBB_CORE_PASSWORD POSTGRES_HASURA_APP_PASSWORD
    POSTGRES_BBB_HASURA_PASSWORD POSTGRES_BLOCKNOTE_PASSWORD)
bbb_require_secret "${PASSWORDS[@]}"
for name in "${PASSWORDS[@]}"; do
    bbb_require_match "$name" '[A-Za-z0-9]{32,}'
done

# 2. derive, 3. render: nothing. The SQL does not depend on the environment (psql reads the
# passwords at run time, passwords.sql), so it is not a template. In render-only mode the
# scripts the job runs are copied out unchanged for review.
if bbb_is_render_only; then
    for f in recreate.sql passwords.sql; do
        dest="$(bbb_path "/usr/share/bbb-db-init/$f")"
        install -D -m 0644 "/usr/share/bbb-db-init/$f" "$dest"
    done
fi

# 5. exec
bbb_exec "$@"
