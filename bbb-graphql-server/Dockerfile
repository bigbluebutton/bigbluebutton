# bbb-graphql-server as BigBlueButton packages it: the iMDT build of Hasura graphql-engine,
# the Hasura CLI of the same version, the metadata and the env file of
# build/packages-template/bbb-graphql-server.
#
# Build with bake (docker/bake/graphql-server.hcl defines the named contexts):
#   docker buildx bake -f docker-bake.hcl $(printf -- '-f %s ' docker/bake/*.hcl) graphql-server
# or with podman (--format docker keeps the HEALTHCHECK):
#   podman build --format docker \
#       --build-context entrypoint-lib=docker/lib \
#       --build-context graphql-server-pkg=build/packages-template/bbb-graphql-server \
#       --build-context bbb-yq-go=build/packages-template/bbb-yq-go \
#       -t bbb-graphql-server bbb-graphql-server
#
# Base: ubuntu:24.04, the bare-metal OS, so the engine links against the same libraries as
# the package (build/packages-template/bbb-graphql-server/opts-noble.sh).

# ubuntu:24.04
FROM docker.io/library/ubuntu@sha256:534baea6a22c03a63003dbc8dbe78fe34bc0d7e595d9a9dc9834884ff530eb55 AS build

ARG TARGETARCH
# The engine as upstream gets it (build.sh): the iMDT repository, branch v2.49.3, which is
# commit cfd9949af4. Both binaries are checked against the sha256 pinned here; the CLI's is
# the digest GitHub publishes for the release asset.
ARG HASURA_VERSION=v2.49.3
ARG HASURA_ENGINE_COMMIT=cfd9949af49573736667475dd1274411a50dfb9a
ARG HASURA_ENGINE_SHA256=06320f1c93944ec9148721b5cf563fe8a733e720fef2bbfbc60f2c99bca7c585
ARG HASURA_CLI_SHA256=332a6c2a9c3b2580791e105ba38618f30900398fb7337a0577e67301df477f3b

SHELL ["/bin/bash", "-eo", "pipefail", "-c"]

# Build tools only; this stage is not part of the image.
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates curl git \
    && rm -rf /var/lib/apt/lists/*

# DL3022 (here and below): named build contexts, not stages.
# hadolint ignore=DL3022
COPY --from=graphql-server-pkg build.sh hasura-config.env /build/pkg/
WORKDIR /build
RUN if [ "$TARGETARCH" != "amd64" ]; then \
        echo "the iMDT engine binary is x86-64 only, not $TARGETARCH" >&2; exit 1; \
    fi \
    && if ! grep -qx "HASURA_VERSION=${HASURA_VERSION}" pkg/build.sh; then \
        echo "build/packages-template/bbb-graphql-server/build.sh no longer uses Hasura ${HASURA_VERSION}" >&2; exit 1; \
    fi

# Engine: build.sh lines "git clone --branch", "cat ...part-a*", "chmod +x".
RUN git clone -q --depth 1 --branch "$HASURA_VERSION" https://github.com/iMDT/hasura-graphql-engine.git \
    && [ "$(git -C hasura-graphql-engine rev-parse HEAD)" = "$HASURA_ENGINE_COMMIT" ] \
    && cat hasura-graphql-engine/hasura-graphql.part-a* > hasura-graphql \
    && rm -rf hasura-graphql-engine/ \
    && echo "${HASURA_ENGINE_SHA256}  hasura-graphql" | sha256sum -c - \
    && install -m 0755 hasura-graphql /build/hasura-graphql-engine \
    && rm hasura-graphql

# CLI: build.sh "Install Hasura CLI" (linux-amd64).
RUN curl -fsSL -o hasura "https://github.com/hasura/graphql-engine/releases/download/${HASURA_VERSION}/cli-hasura-linux-amd64" \
    && echo "${HASURA_CLI_SHA256}  hasura" | sha256sum -c - \
    && chmod 0755 hasura \
    && HOME=/tmp ./hasura version --skip-update-check

# yq as upstream packages it (bbb-yq-go): version from its build.sh, verified against its
# checksum file (amd64 only, like upstream).
# hadolint ignore=DL3022
COPY --from=bbb-yq-go build.sh bbb-yq-go.sha256sum /build/yq/
WORKDIR /build/yq
RUN yq_version="$(sed -n 's/^YQ_VERSION=//p' build.sh)" \
    && curl -fsSLO "https://github.com/mikefarah/yq/releases/download/v${yq_version}/yq_linux_amd64" \
    && grep ' yq_linux_amd64$' bbb-yq-go.sha256sum | sha256sum -c - \
    && install -m 0755 yq_linux_amd64 /usr/local/bin/yq

# The env file /etc/default/bbb-graphql-server as a template: the packaged hasura-config.env
# with the container wiring (postgres, akka-apps, graphql-actions instead of 127.0.0.1) and
# the hasura_app password from the contract instead of upstream's fixed one. Exactly these
# three lines change and no setting is left on 127.0.0.1 (the commented-out line 2 stays), so
# an upstream change to these lines fails the build.
WORKDIR /build
# hadolint ignore=SC2016
RUN sed -e 's|^\(HASURA_GRAPHQL_DATABASE_URL=postgres://hasura_app:\)hasura_app@127\.0\.0\.1:|\1${POSTGRES_HASURA_APP_PASSWORD}@postgres:|' \
        -e 's|^\(HASURA_GRAPHQL_AUTH_HOOK=http://\)127\.0\.0\.1\(:8901/userInfo\)$|\1akka-apps\2|' \
        -e 's|^\(HASURA_BBB_GRAPHQL_ACTIONS_ADAPTER_URL=http://\)127\.0\.0\.1\(:8093\)$|\1graphql-actions\2|' \
        pkg/hasura-config.env > bbb-graphql-server.env \
    && [ "$(diff pkg/hasura-config.env bbb-graphql-server.env | grep -c '^>')" = 3 ] \
    && ! grep -v '^#' bbb-graphql-server.env | grep -q '127\.0\.0\.1'


# ubuntu:24.04
FROM docker.io/library/ubuntu@sha256:534baea6a22c03a63003dbc8dbe78fe34bc0d7e595d9a9dc9834884ff530eb55

SHELL ["/bin/bash", "-eo", "pipefail", "-c"]

# The engine's shared libraries (libpq5, libodbc2, libgmp10; libkrb5-3 and libnuma1 as the
# package depends on them, opts-noble.sh), curl for the healthcheck, envsubst for the helper.
# netbase: /etc/protocols, which bare metal has but the base image lacks; without it
# the engine's HTTP client fails before it connects ("Connection failure"), and every request
# failed in the auth hook (akka-apps /userInfo; seen with Docker Engine 29.9.1).
# The directories of the files copied below, traversable by any UID (docker/README.md).
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates curl gettext-base \
        libgmp10 libkrb5-3 libnuma1 libodbc2 libpq5 netbase \
    && rm -rf /var/lib/apt/lists/* \
    && install -d -m 0755 /usr/share/bbb-graphql-server /usr/local/share/bbb/templates \
        /usr/local/lib/bbb

COPY --from=build /build/hasura-graphql-engine /build/hasura /usr/bin/
COPY --from=build /usr/local/bin/yq /usr/local/bin/yq
RUN ! ldd /usr/bin/hasura-graphql-engine | grep 'not found' \
    && /usr/bin/hasura-graphql-engine version

# Files at their bare-metal paths (build.sh: bbb_schema.sql, metadata and config.yaml in
# /usr/share/bbb-graphql-server, a+rX).
COPY --chmod=0644 bbb_schema.sql config.yaml /usr/share/bbb-graphql-server/
COPY metadata /usr/share/bbb-graphql-server/metadata
# `hasura metadata apply` creates the (unused) migrations and seeds directories of config.yaml
# version 3 next to it, as root on bare metal; the image ships them, as after the first apply.
RUN install -d -m 0755 /usr/share/bbb-graphql-server/migrations /usr/share/bbb-graphql-server/seeds \
    && chmod -R a+rX /usr/share/bbb-graphql-server

# The entrypoint renders the three files that hold secrets at start, as any UID/GID, into
# /run/bbb-graphql-server; their bare-metal paths link there. The packaged versions it starts
# from are kept in /usr/local/share/bbb/graphql-server.
COPY --from=build --chmod=0644 /build/bbb-graphql-server.env /usr/local/share/bbb/templates/bbb-graphql-server.env
RUN install -d -m 0755 /usr/local/share/bbb/graphql-server \
    && mv /usr/share/bbb-graphql-server/config.yaml \
        /usr/share/bbb-graphql-server/metadata/databases/databases.yaml \
        /usr/local/share/bbb/graphql-server/ \
    && install -d -m 1777 /run/bbb-graphql-server \
    && ln -s /run/bbb-graphql-server/config.yaml /usr/share/bbb-graphql-server/config.yaml \
    && ln -s /run/bbb-graphql-server/databases.yaml /usr/share/bbb-graphql-server/metadata/databases/databases.yaml \
    && ln -s /run/bbb-graphql-server/bbb-graphql-server.env /etc/default/bbb-graphql-server

# DL3022: entrypoint-lib is a named build context, not a stage.
# hadolint ignore=DL3022
COPY --from=entrypoint-lib --chmod=0644 entrypoint-lib.sh /usr/local/lib/bbb/entrypoint-lib.sh
COPY --chmod=0755 docker/entrypoint.sh /entrypoint.sh

# The unit's instance port (bbb-graphql-server@8085) and working directory. The hasura CLI
# keeps its state in $HOME (docker/README.md, rule 4).
ENV HASURA_GRAPHQL_SERVER_PORT=8085 \
    HOME=/tmp
WORKDIR /usr/bin

USER 998:998
EXPOSE 8085/tcp
HEALTHCHECK --interval=10s --timeout=5s --start-period=120s --retries=3 \
    CMD ["curl", "-fsS", "-o", "/dev/null", "http://127.0.0.1:8085/healthz"]
ENTRYPOINT ["/entrypoint.sh"]
CMD ["/usr/bin/hasura-graphql-engine", "serve"]
