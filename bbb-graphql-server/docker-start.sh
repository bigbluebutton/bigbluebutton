#!/bin/bash
set -e

cd /app/

# patch database url
# TODO: this should be possible upstream in BBB via an environment variable
yq e -i ".[1].configuration.connection_info.database_url = \"$HASURA_GRAPHQL_BBB_DATABASE_URL\"" metadata/databases/databases.yaml

sed -i "s/^admin_secret: .*/admin_secret: $HASURA_GRAPHQL_ADMIN_SECRET/g" /app/config.yaml

echo "Starting hasura-graphql-engine"
gosu nobody graphql-engine serve &
PID=$!

sleep 1


#Check if Hasura is ready before applying metadata
while ! netstat -tuln | grep ":$HASURA_GRAPHQL_SERVER_PORT " > /dev/null; do
    echo "Waiting for Hasura's port ($HASURA_GRAPHQL_SERVER_PORT) to be ready..."
    sleep 1
done

echo "Applying new metadata to Hasura"
/usr/local/bin/hasura metadata apply --skip-update-check

wait "$PID"