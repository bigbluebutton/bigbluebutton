# db-init: run-only job that (re)creates the BigBlueButton databases and roles in the postgres
# service, as the packages do on upgrades. See bbb-db-init.sh for what it does on each run.
#
# Build with bake (docker/bake/db-init.hcl) or with podman:
#   podman build --build-context entrypoint-lib=docker/lib \
#       --build-context graphql-server=bbb-graphql-server \
#       --build-context shared-notes-server=bbb-shared-notes-server docker/db-init
#
# Base: the same image as docker/postgres, so psql matches the server and the job adds only
# about 150 kB to what a host pulls for postgres anyway.

# postgres:16.15-trixie
FROM docker.io/library/postgres@sha256:ca0bd484cb98bf4b24eb1010e73fb3fcbd6714d240fbc1a10eea5b7dbecb641d

# The directories of the files copied below, traversable by any UID (docker/README.md).
RUN install -d -m 0755 /usr/local/lib/bbb /usr/share/bbb-graphql-server \
        /usr/share/bbb-shared-notes-server /usr/share/bbb-db-init

# DL3022 (here and below): named build contexts, not stages.
# hadolint ignore=DL3022
COPY --from=entrypoint-lib --chmod=0644 entrypoint-lib.sh /usr/local/lib/bbb/entrypoint-lib.sh
# The schemas at their bare-metal paths (build/packages-template/bbb-graphql-server/build.sh,
# build/packages-template/bbb-shared-notes-server/build.sh).
# hadolint ignore=DL3022
COPY --from=graphql-server --chmod=0644 bbb_schema.sql /usr/share/bbb-graphql-server/bbb_schema.sql
# hadolint ignore=DL3022
COPY --from=shared-notes-server --chmod=0644 blocknote_schema.sql /usr/share/bbb-shared-notes-server/blocknote_schema.sql
COPY --chmod=0644 recreate.sql passwords.sql /usr/share/bbb-db-init/
COPY --chmod=0755 bbb-db-init.sh /usr/local/bin/bbb-db-init
COPY --chmod=0755 entrypoint.sh /entrypoint.sh

# Image version (see bbb-db-init.sh): the release version set by docker/metadata-action in CI,
# and a checksum of everything the job runs.
ARG DOCKER_META_VERSION=local
SHELL ["/bin/bash", "-o", "pipefail", "-c"]
RUN printf '%s sha256:%s\n' "$DOCKER_META_VERSION" "$(cat /usr/share/bbb-db-init/recreate.sql \
        /usr/share/bbb-db-init/passwords.sql /usr/share/bbb-graphql-server/bbb_schema.sql \
        /usr/share/bbb-shared-notes-server/blocknote_schema.sql | sha256sum | cut -d ' ' -f 1)" \
        > /usr/share/bbb-db-init/version

# The superuser connection; the service name of postgres in docker-compose.yml.
ENV PGHOST=postgres \
    PGPORT=5432

USER 999:999

# A job, not a service: Compose waits for it with `service_completed_successfully`.
HEALTHCHECK NONE

ENTRYPOINT ["/entrypoint.sh"]
CMD ["/usr/local/bin/bbb-db-init"]
