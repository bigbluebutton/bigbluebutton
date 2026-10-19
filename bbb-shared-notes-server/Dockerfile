# bbb-shared-notes-server as BigBlueButton packages it (build/packages-template/
# bbb-shared-notes-server): the compiled server in /usr/share/bbb-shared-notes-server, started by
# node in that directory like the systemd unit does, with wkhtmltopdf for the PDF export.
#
# Build with bake (docker/bake/shared-notes.hcl defines the named contexts):
#   docker buildx bake -f docker-bake.hcl $(printf -- '-f %s ' docker/bake/*.hcl) shared-notes
# or with podman (--format docker keeps the HEALTHCHECK):
#   podman build --format docker \
#       --build-context entrypoint-lib=docker/lib \
#       --build-context bbb-yq-go=build/packages-template/bbb-yq-go \
#       -t bbb-shared-notes-server bbb-shared-notes-server

# node:24.22.0-slim (the package depends on nodejs >= 24, << 25)
FROM docker.io/library/node@sha256:a5f4366e834695d5f363b920c104953a535d3a9864d1bdf74566a0ebe01daee5 AS build

ARG TARGETARCH
# The Twemoji release that scripts/download-twemoji-assets.mjs downloads (TWEMOJI_VERSION),
# pinned by checksum here; the script itself does not verify it.
ARG TWEMOJI_VERSION=14.0.2
ARG TWEMOJI_SHA256=27dc3087fd067d321aff3e859056773aca748510b18b8b058276f6fa57e7f16c

SHELL ["/bin/bash", "-o", "pipefail", "-c"]

# Build tools only; this stage is not part of the image.
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates curl gcc libc6-dev \
    && rm -rf /var/lib/apt/lists/*

# Same steps as build/packages-template/bbb-shared-notes-server/build.sh: compile, rename to
# bbb-shared-notes-server.js, ship it with package files, config, node_modules and assets.
# Install scripts are skipped: the only one that matters is the package's own postinstall
# (the unverified Twemoji download), replaced by the checked download below.
WORKDIR /build/src
COPY package.json package-lock.json tsconfig.json ./
COPY scripts/ scripts/
COPY src/ src/
RUN npm ci --no-progress --ignore-scripts \
    && npm run build

# The extraction of scripts/download-twemoji-assets.mjs, from a checked tarball.
RUN curl -fsSLo /tmp/twemoji.tar.gz \
        "https://github.com/twitter/twemoji/archive/refs/tags/v${TWEMOJI_VERSION}.tar.gz" \
    && echo "${TWEMOJI_SHA256}  /tmp/twemoji.tar.gz" | sha256sum -c - \
    && mkdir -p assets/twemoji/svg \
    && tar xzf /tmp/twemoji.tar.gz --strip-components=3 -C assets/twemoji/svg \
        "twemoji-${TWEMOJI_VERSION}/assets/svg" \
    && rm /tmp/twemoji.tar.gz

WORKDIR /build/bbb-shared-notes-server
COPY blocknote_schema.sql config/default.yml ./
# The source maps of the dependencies are not shipped: node reads them only with
# --enable-source-maps, which the server does not use.
RUN mv ../src/dist/index.js bbb-shared-notes-server.js \
    && mv ../src/dist/* . \
    && cp -r ../src/package.json ../src/package-lock.json ../src/assets . \
    && npm ci --no-progress --omit=dev --ignore-scripts \
    && npm cache clean --force \
    && find node_modules -type f -name '*.map' -delete

# yq as upstream packages it (bbb-yq-go): version from its build.sh, verified against its
# checksum file (amd64 and arm64).
# DL3022: bbb-yq-go is a named build context, not a stage.
# hadolint ignore=DL3022
COPY --from=bbb-yq-go build.sh bbb-yq-go.sha256sum /build/yq/
WORKDIR /build/yq
RUN case "$TARGETARCH" in \
        amd64|arm64) asset="yq_linux_${TARGETARCH}" ;; \
        *) echo "bbb-yq-go.sha256sum has no entry for $TARGETARCH" >&2; exit 1 ;; \
    esac \
    && yq_version="$(sed -n 's/^YQ_VERSION=//p' build.sh)" \
    && curl -fsSLO "https://github.com/mikefarah/yq/releases/download/v${yq_version}/${asset}" \
    && grep " ${asset}$" bbb-yq-go.sha256sum | sha256sum -c - \
    && install -m 0755 "$asset" /usr/local/bin/yq

# The PDF converter's network sandbox (docker/run-in-systemd.sh), statically linked.
COPY docker/no-network.c /build/no-network/
RUN gcc -O2 -Wall -Wextra -Werror -static -o /usr/local/bin/no-network /build/no-network/no-network.c


# node:24.22.0-slim
FROM docker.io/library/node@sha256:a5f4366e834695d5f363b920c104953a535d3a9864d1bdf74566a0ebe01daee5

# wkhtmltopdf: package dependency (opts-noble.sh), run by the PDF export. tini as PID 1: node
# as PID 1 ignores SIGTERM (the server installs no handler), so stopping the container would
# wait for SIGKILL.
RUN apt-get update \
    && apt-get install -y --no-install-recommends tini wkhtmltopdf \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build /usr/local/bin/yq /usr/local/bin/yq
COPY --from=build /usr/local/bin/no-network /usr/local/bin/no-network
COPY --from=build /build/bbb-shared-notes-server /usr/share/bbb-shared-notes-server
# The packaged default.yml is the entrypoint's input; it writes the configured copy to
# config/default.yml, the path the server reads (src/config/index.ts).
RUN install -D -m 0644 /usr/share/bbb-shared-notes-server/default.yml \
        /usr/local/share/bbb-shared-notes-server/default.yml \
    && rm /usr/share/bbb-shared-notes-server/default.yml \
    && install -d -m 1777 /usr/share/bbb-shared-notes-server/config
COPY --chmod=0755 docker/run-in-systemd.sh /usr/share/bbb-shared-notes-server/run-in-systemd.sh
# The helper's directory is created first, traversable by any UID (docker/README.md).
# DL3022: entrypoint-lib is a named build context, not a stage.
RUN install -d -m 0755 /usr/local/lib/bbb
# hadolint ignore=DL3022
COPY --from=entrypoint-lib --chmod=0644 entrypoint-lib.sh /usr/local/lib/bbb/entrypoint-lib.sh
COPY --chmod=0755 docker/entrypoint.sh /entrypoint.sh

# NODE_ENV as in the systemd unit.
ENV NODE_ENV=production

# The unit runs it as bigbluebutton; here any non-root UID works (it writes only the rendered
# config and commandExecution.workDir below /tmp).
USER 998:998
WORKDIR /usr/share/bbb-shared-notes-server
EXPOSE 8787
# A TCP connect, not an HTTP request: every request counts against the rate limit that the
# server's own loopback requests share (src/express/index.ts). The server listens only after
# its redis subscriber is connected (src/index.ts).
HEALTHCHECK --interval=10s --timeout=3s --start-period=15s --retries=3 \
    CMD ["node", "-e", "require('net').connect(8787, '127.0.0.1').on('connect', () => process.exit(0)).on('error', () => process.exit(1))"]
ENTRYPOINT ["/usr/bin/tini", "--", "/entrypoint.sh"]
CMD ["node", "bbb-shared-notes-server.js"]
