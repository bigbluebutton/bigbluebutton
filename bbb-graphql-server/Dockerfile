ARG HASURA_VERSION=v2.46.0

FROM debian:bookworm-slim AS build

RUN apt-get -y update; apt-get -y install curl
RUN curl -L https://github.com/hasura/graphql-engine/raw/stable/cli/get.sh | INSTALL_PATH=/usr/local/bin VERSION=${HASURA_VERSION} bash
RUN curl -L -o /usr/local/bin/yq https://github.com/mikefarah/yq/releases/latest/download/yq_linux_amd64 && chmod a+x /usr/local/bin/yq

# ----------------------------
FROM hasura/graphql-engine:${HASURA_VERSION}

# install netstat, required for start script
RUN apt-get update && apt-get install -y net-tools gosu

COPY --from=build /usr/local/bin/yq /usr/local/bin/yq
COPY --from=build /usr/local/bin/hasura /usr/local/bin/hasura

COPY bbb_schema.sql /app/
COPY metadata /app/metadata

COPY config.yaml /app/config.yaml
COPY docker-entrypoint.sh /entrypoint.sh
COPY docker-start.sh /app/start.sh

ENTRYPOINT [ "/entrypoint.sh" ]
CMD [ "/app/start.sh" ]
