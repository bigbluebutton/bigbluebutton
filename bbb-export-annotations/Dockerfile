# syntax=docker/dockerfile:1
# bbb-export-annotations as BigBlueButton packages it (build/packages-template/
# bbb-export-annotations): the app with its production node_modules in
# /usr/local/bigbluebutton/bbb-export-annotations, started there with `node master.js` like the
# systemd unit, the fonts in /usr/local/share/fonts, the blank slide of bbb-web, and the tools
# its settings.json calls (cairosvg, gs, pdftocairo).
#
# Build with bake (docker/bake/export-annotations.hcl defines the named contexts):
#   docker buildx bake -f docker-bake.hcl $(printf -- '-f %s ' docker/bake/*.hcl) export-annotations
# or with podman (--format docker keeps the HEALTHCHECK):
#   podman build --format docker \
#       --build-context entrypoint-lib=docker/lib \
#       --build-context bbb-yq-go=build/packages-template/bbb-yq-go \
#       --build-context fonts=build/packages-template/bbb-export-annotations/fonts \
#       --build-context slides=bigbluebutton-config/slides \
#       -t bbb-export-annotations bbb-export-annotations

# node:24.22.0-slim (the package depends on nodejs >= 24, << 25)
FROM docker.io/library/node@sha256:a5f4366e834695d5f363b920c104953a535d3a9864d1bdf74566a0ebe01daee5 AS build

ARG TARGETARCH

SHELL ["/bin/bash", "-o", "pipefail", "-c"]

# Build tools only; this stage is not part of the image.
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates curl \
    && rm -rf /var/lib/apt/lists/*

# Same steps as build/packages-template/bbb-export-annotations/build.sh: the source tree with
# its production dependencies (`npm install --production`; npm ci installs the same from the
# lock file), readable by everyone. The image files are not part of the app.
WORKDIR /build/bbb-export-annotations
COPY package.json package-lock.json .npmrc ./
RUN npm ci --no-progress --omit=dev \
    && npm cache clean --force
COPY --exclude=Dockerfile --exclude=docker --exclude=node_modules . .
RUN chmod -R a+rX .

# yq as upstream packages it (bbb-yq-go): version from its build.sh, verified against its
# checksum file (amd64 only, like upstream).
# DL3022: bbb-yq-go is a named build context, not a stage.
# hadolint ignore=DL3022
COPY --from=bbb-yq-go build.sh bbb-yq-go.sha256sum /build/yq/
WORKDIR /build/yq
RUN if [ "$TARGETARCH" != "amd64" ]; then \
        echo "upstream bbb-yq-go.sha256sum only covers amd64, not $TARGETARCH" >&2; exit 1; \
    fi \
    && yq_version="$(sed -n 's/^YQ_VERSION=//p' build.sh)" \
    && curl -fsSLO "https://github.com/mikefarah/yq/releases/download/v${yq_version}/yq_linux_amd64" \
    && grep ' yq_linux_amd64$' bbb-yq-go.sha256sum | sha256sum -c - \
    && install -m 0755 yq_linux_amd64 /usr/local/bin/yq


# ubuntu:24.04: export-annotations shells out to document tools (ghostscript and cairosvg)
FROM docker.io/library/ubuntu@sha256:534baea6a22c03a63003dbc8dbe78fe34bc0d7e595d9a9dc9834884ff530eb55

# cairosvg, ghostscript: package dependencies (opts-noble.sh). poppler-utils: pdftocairo
# (settings.json shared.pdftocairo). fontconfig: fc-cache, which the package runs after install
# (after-install.sh). tini as PID 1: node as PID 1 ignores SIGTERM (master.js installs no
# handler), so stopping the container would wait for SIGKILL.
RUN apt-get update \
    && apt-get install -y --no-install-recommends cairosvg fontconfig ghostscript poppler-utils tini \
    && rm -rf /var/lib/apt/lists/*

# Node 24 from the official image, at the path of the distribution package that the unit runs
# (ExecStart=/usr/bin/node).
COPY --from=build /usr/local/bin/node /usr/bin/node
COPY --from=build /usr/local/bin/yq /usr/local/bin/yq
COPY --from=build /build/bbb-export-annotations /usr/local/bigbluebutton/bbb-export-annotations

# Package files: the fonts (build.sh: fonts/* to /usr/local/share/fonts, then fc-cache -f as in
# after-install.sh) and the blank slide that bbb-web ships, byte-identical (it is compared
# byte by byte, lib/utils/slide-background.js). Directories are created first, traversable by
# any UID (docker/README.md).
# DL3022: fonts and slides are named build contexts (docker/bake/export-annotations.hcl).
RUN install -d -m 0755 /usr/local/share/fonts /usr/share/bigbluebutton/blank
# hadolint ignore=DL3022
COPY --from=fonts --chmod=0644 IBMPlexMono-Medium.woff2 IBMPlexSans-Medium.woff2 IBMPlexSerif-Medium.woff2 Shantell_Sans-Tldrawish.woff2 /usr/local/share/fonts/
# hadolint ignore=DL3022
COPY --from=slides --chmod=0644 blank-svg.svg /usr/share/bigbluebutton/blank/
RUN fc-cache -f

# The packaged settings.json is the entrypoint's input; it writes the configured copy to
# config/settings.json, the path the app reads relative to its working directory. That
# directory, the data volume (exports are written below the presentation directory) are
# writable for any UID; the dropbox (presAnnDropboxDir) is below /tmp.
ARG APP=/usr/local/bigbluebutton/bbb-export-annotations
RUN install -D -m 0644 "$APP/config/settings.json" /usr/local/share/bbb-export-annotations/settings.json \
    && rm -r "$APP/config" \
    && install -d -m 1777 "$APP/config" /var/bigbluebutton

# The helper's directory is created first, traversable by any UID (docker/README.md).
# DL3022: entrypoint-lib is a named build context, not a stage.
RUN install -d -m 0755 /usr/local/lib/bbb
# hadolint ignore=DL3022
COPY --from=entrypoint-lib --chmod=0644 entrypoint-lib.sh /usr/local/lib/bbb/entrypoint-lib.sh
COPY --chmod=0755 docker/healthcheck.sh /usr/local/lib/bbb/export-annotations-healthcheck.sh
COPY --chmod=0755 docker/entrypoint.sh /entrypoint.sh

# NODE_ENV as in the systemd unit.
ENV NODE_ENV=production

# The unit runs it as bigbluebutton; here any non-root UID works. Default BBB_UID/BBB_GID
# (docker/config-contract.yaml); compose sets the deployment's ids, as for the other writers
# of the data volume.
USER 998:998
WORKDIR /usr/local/bigbluebutton/bbb-export-annotations
# No port: the app only pops jobs from a redis list. The check is on the process and its redis
# connection (docker/healthcheck.sh).
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD ["/usr/local/lib/bbb/export-annotations-healthcheck.sh"]
ENTRYPOINT ["/usr/bin/tini", "--", "/entrypoint.sh"]
CMD ["node", "master.js"]
