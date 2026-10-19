# PostgreSQL server for BigBlueButton: the official postgres image with BBB's server settings.
#
# Build with bake (docker/bake/postgres.hcl) or with podman:
#   podman build --build-context graphql-server-pkg=build/packages-template/bbb-graphql-server \
#       -f docker/postgres/Dockerfile docker/postgres
#
# No BBB entrypoint: the official image's own mechanisms are enough.
# - POSTGRES_PASSWORD (contract) sets the superuser password when the data volume is first
#   initialized, as documented for the official image. The BBB databases and roles are created
#   by the separate db-init job (docker/db-init/), not by an initdb script, so they are
#   recreated on upgrades as on bare metal.
# - Server settings come from conf.d at the bare-metal path,
#   /etc/postgresql/16/main/conf.d/*.conf; a Tier 3 file mounted there is read the same way.
#   initdb copies postgresql.conf.sample into a new data directory, so the include_dir line
#   added below ends up in every cluster this image creates.

# postgres:16.15-trixie (PostgreSQL 16, as bare metal: postgresql-16 in
# build/packages-template/bbb-graphql-server/opts-noble.sh)
FROM docker.io/library/postgres@sha256:ca0bd484cb98bf4b24eb1010e73fb3fcbd6714d240fbc1a10eea5b7dbecb641d

# BBB's packaged server settings (max_connections), copied as bare metal installs them
# (build/packages-template/bbb-graphql-server/build.sh), into a directory traversable by any UID
# (docker/README.md). DL3022: named build context.
RUN install -d -m 0755 /etc/postgresql/16/main/conf.d
# hadolint ignore=DL3022
COPY --from=graphql-server-pkg --chmod=0644 bbb-pg.conf /etc/postgresql/16/main/conf.d/bbb-pg.conf

RUN printf "\ninclude_dir = '/etc/postgresql/16/main/conf.d'\n" >> /usr/share/postgresql/postgresql.conf.sample

# The postgres user of the official image (999:999). PostgreSQL only starts when the data
# directory is owned by the user it runs as, so this image cannot run under an arbitrary
# UID with a volume created by another one. A new named volume gets its owner from the image
# directory (postgres, see the official Dockerfile), so no chown or gosu is needed at start.
USER 999:999

# TCP on purpose: during first initialization the official entrypoint runs a temporary server
# on the Unix socket only, which must not count as ready.
HEALTHCHECK --interval=10s --timeout=5s --start-period=60s --retries=5 \
    CMD ["pg_isready", "-q", "-h", "127.0.0.1", "-U", "postgres", "-d", "postgres"]
