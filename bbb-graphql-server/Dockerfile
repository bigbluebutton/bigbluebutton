# Same Hasura version as build/packages-template/bbb-graphql-server/build.sh
FROM hasura/graphql-engine:v2.49.3-ce.cli-migrations-v3@sha256:d3889fe021838f1a200aaeac7c57b9c0245e46990305fa92e73c4d9c65676958 AS hasura

FROM ubuntu:24.04@sha256:68ee22004a9109b44973313b02ff7b1de250f1de0f5ecb628d73f579aaff33ac

# Libraries of the engine as in opts-noble.sh; netcat for Hasura's entrypoint; netbase for
# /etc/protocols, without which the engine makes no outbound HTTP call (the auth hook)
RUN apt-get update && apt-get install -y --no-install-recommends libpq5 libkrb5-3 libnuma1 libodbc2 netcat-openbsd \
        netbase ca-certificates \
 && rm -rf /var/lib/apt/lists/* \
 && groupadd -g 998 bigbluebutton && useradd -u 998 -g 998 -m bigbluebutton

# Hasura's entrypoint applies the metadata before it starts the engine
COPY --from=hasura /usr/bin/graphql-engine /usr/bin/hasura-cli /bin/docker-entrypoint.sh /usr/bin/
COPY bbb_schema.sql /usr/share/bbb-graphql-server/
COPY metadata /usr/share/bbb-graphql-server/metadata
# Read the BigBlueButton database URL from env like the default database
RUN sed -i 's|database_url: postgres://bbb_hasura.*|database_url: { from_env: HASURA_GRAPHQL_BBB_DATABASE_URL }|' \
    /usr/share/bbb-graphql-server/metadata/databases/databases.yaml

# Defaults of build/packages-template/bbb-graphql-server/hasura-config.env and the systemd unit
ENV HGE_BINARY=graphql-engine \
    HASURA_GRAPHQL_SHOW_UPDATE_NOTIFICATION=false \
    HASURA_GRAPHQL_METADATA_DIR=/usr/share/bbb-graphql-server/metadata \
    HASURA_GRAPHQL_SERVER_PORT=8085 \
    HASURA_GRAPHQL_DATABASE_URL=postgres://hasura_app:hasura_app@127.0.0.1:5432/hasura_app \
    HASURA_GRAPHQL_BBB_DATABASE_URL=postgres://bbb_hasura:bbb_hasura@127.0.0.1:5432/bbb_graphql \
    HASURA_GRAPHQL_LOG_LEVEL=warn \
    HASURA_GRAPHQL_ENABLE_CONSOLE=false \
    HASURA_GRAPHQL_LIVE_QUERIES_MULTIPLEXED_REFETCH_INTERVAL=333 \
    HASURA_GRAPHQL_LIVE_QUERIES_MULTIPLEXED_BATCH_SIZE=1000 \
    HASURA_GRAPHQL_STREAMING_QUERIES_MULTIPLEXED_REFETCH_INTERVAL=150 \
    HASURA_GRAPHQL_STREAMING_QUERIES_MULTIPLEXED_BATCH_SIZE=1000 \
    HASURA_GRAPHQL_ENABLE_TELEMETRY=false \
    HASURA_GRAPHQL_WEBSOCKET_KEEPALIVE=10 \
    HASURA_GRAPHQL_AUTH_HOOK=http://127.0.0.1:8901/userInfo \
    HASURA_BBB_GRAPHQL_ACTIONS_ADAPTER_URL=http://127.0.0.1:8093

USER bigbluebutton
EXPOSE 8085
HEALTHCHECK CMD nc -z 127.0.0.1 8085 || exit 1
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["graphql-engine", "serve"]
