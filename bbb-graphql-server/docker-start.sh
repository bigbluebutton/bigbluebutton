#!/bin/bash
set -euo pipefail

cd /app/

# Wait until Postgres accepts TCP connections. Compose `depends_on: service_healthy`
# covers the common case; this guards restarts and slow first-boot init.
echo "Waiting for Postgres at postgres:5432..."
for i in $(seq 1 90); do
  if (echo > /dev/tcp/postgres/5432) >/dev/null 2>&1; then
    echo "Postgres is reachable"
    break
  fi
  if [ "$i" -eq 90 ]; then
    echo "Postgres is not reachable; giving up" >&2
    exit 1
  fi
  sleep 1
done

# Brief grace period so init scripts / post-restart listen are fully settled
sleep 2

# patch database url
# TODO: this should be possible upstream in BBB via an environment variable
yq e -i ".[1].configuration.connection_info.database_url = \"$HASURA_GRAPHQL_BBB_DATABASE_URL\"" metadata/databases/databases.yaml

sed -i "s/^admin_secret: .*/admin_secret: $HASURA_GRAPHQL_ADMIN_SECRET/g" /app/config.yaml

echo "Starting hasura-graphql-engine"
gosu nobody graphql-engine serve &
PID=$!

# Wait for Hasura to listen — exit if the process dies (so restart policy can retry)
for i in $(seq 1 90); do
  if ! kill -0 "$PID" 2>/dev/null; then
    echo "Hasura exited before binding port ${HASURA_GRAPHQL_SERVER_PORT}" >&2
    wait "$PID" || true
    exit 1
  fi
  if netstat -tuln | grep -q ":${HASURA_GRAPHQL_SERVER_PORT} "; then
    echo "Hasura is listening on ${HASURA_GRAPHQL_SERVER_PORT}"
    break
  fi
  if [ "$i" -eq 90 ]; then
    echo "Timed out waiting for Hasura port ${HASURA_GRAPHQL_SERVER_PORT}" >&2
    kill "$PID" 2>/dev/null || true
    exit 1
  fi
  echo "Waiting for Hasura's port (${HASURA_GRAPHQL_SERVER_PORT}) to be ready..."
  sleep 1
done

echo "Applying new metadata to Hasura"
/usr/local/bin/hasura metadata apply --skip-update-check

wait "$PID"
