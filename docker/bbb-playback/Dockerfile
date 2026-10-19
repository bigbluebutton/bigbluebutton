# Recording playback: the player of the presentation format (bbb-playback), served by nginx on
# port 8080 with the package's location (playback.nginx). The edge nginx (docker/nginx) proxies
# /playback/presentation/2.3 to it (compose service `playback`, profile `recording`) and serves
# the published recordings (/presentation/<recordId>/...) from the bbb-data volume itself.
#
# bbb-playback's repository publishes images for its branches only, not for its release tags,
# so the player is built here from the release BigBlueButton pins (bbb-playback.placeholder.sh),
# fetched by its commit as the named context `bbb-playback` (docker/bake/bbb-playback.hcl).
#
# Build with bake or with podman:
#   podman build --build-context entrypoint-lib=docker/lib \
#     --build-context packages=build/packages-template \
#     --build-context bbb-playback=<checkout of bbb-playback at that commit> docker/bbb-playback
#
# Steps as in build/packages-template/bbb-playback/build.sh: the build identifier
# REACT_APP_BBB_PLAYBACK_BUILD (`git rev-parse --short HEAD` there; the context has no .git, so
# bake passes it), `npm run-script build`, the bbb-playback-version file next to the build.
# `npm ci` instead of `npm install`: the lock file's versions, as the repository's own
# Dockerfile builds it. build.sh's `jq ... src/config.json` is left out: the release has no
# src/config.json (its configuration is src/config.js), and the jq call changes nothing there.

# node:24.22.0-slim (package.json engines: node >= 20; the packages build with Node 24)
FROM docker.io/library/node@sha256:a5f4366e834695d5f363b920c104953a535d3a9864d1bdf74566a0ebe01daee5 AS build

SHELL ["/bin/bash", "-o", "pipefail", "-c"]
WORKDIR /src

# DL3022: bbb-playback is a named build context, not a stage.
# hadolint ignore=DL3022
COPY --from=bbb-playback package.json package-lock.json ./
RUN npm ci

# hadolint ignore=DL3022
COPY --from=bbb-playback jsconfig.json ./
# hadolint ignore=DL3022
COPY --from=bbb-playback public public
# hadolint ignore=DL3022
COPY --from=bbb-playback src src

ARG BBB_PLAYBACK_BUILD=
RUN test -n "$BBB_PLAYBACK_BUILD" || { echo "BBB_PLAYBACK_BUILD is not set" >&2; exit 1; } \
    && REACT_APP_BBB_PLAYBACK_BUILD="$BBB_PLAYBACK_BUILD" npm run-script build \
    && grep '"version":' package.json | sed -e 's|.* "||g' -e 's|".*||g' > build/bbb-playback-version \
    && chmod -R a+rX,go-w build

# nginx:1.30.6-alpine (stable-alpine), the base of the edge nginx (docker/nginx)
FROM docker.io/library/nginx@sha256:970364228b1e4f932abc22d321932816782cca8a20b85a77552a7cfe9acfb3b5

# bash for the entrypoint helper; curl (healthcheck) is part of the base image. The base image's
# default site is replaced by this image's server. nginx.conf: no user switch (the master runs as
# the container's non-root UID) and the pid file in /tmp; the build fails if the base image's
# lines changed.
RUN apk add --no-cache bash \
    && rm -f /etc/nginx/conf.d/default.conf \
    && sed -i -e '/^user  nginx;$/d' -e 's|^pid        /run/nginx\.pid;$|pid        /tmp/nginx.pid;|' \
        /etc/nginx/nginx.conf \
    && if grep -q '^user' /etc/nginx/nginx.conf || ! grep -q '^pid        /tmp/nginx\.pid;$' /etc/nginx/nginx.conf; then \
         echo "nginx.conf of the base image changed, edit not applied" >&2; exit 1; \
       fi \
    && install -d -m 0755 /usr/share/bigbluebutton/nginx /usr/share/bigbluebutton/playback/presentation \
        /usr/local/lib/bbb

# The package's location fragment at the path it installs it to (build.sh). The player is below
# /usr/share/bigbluebutton instead of /var/bigbluebutton, the mount point of the bbb-data volume,
# which holds data only: the root line follows it, and the build fails if the edit did not apply.
# DL3022: packages is a named build context (./build/packages-template), not a stage.
# hadolint ignore=DL3022
COPY --from=packages --chmod=0644 bbb-playback/playback.nginx /usr/share/bigbluebutton/nginx/
RUN sed -i 's|^  root /var/bigbluebutton;$|  root /usr/share/bigbluebutton;|' \
        /usr/share/bigbluebutton/nginx/playback.nginx \
    && if ! grep -q '^  root /usr/share/bigbluebutton;$' /usr/share/bigbluebutton/nginx/playback.nginx; then \
         echo "playback.nginx: upstream fragment changed, edit not applied" >&2; exit 1; \
       fi
COPY --chmod=0644 playback.conf /etc/nginx/conf.d/playback.conf
COPY --from=build /src/build /usr/share/bigbluebutton/playback/presentation/2.3

# Shared entrypoint helper (P3).
# hadolint ignore=DL3022
COPY --from=entrypoint-lib --chmod=0644 entrypoint-lib.sh /usr/local/lib/bbb/entrypoint-lib.sh
COPY --chmod=0755 entrypoint.sh /entrypoint.sh

# The base image's nginx UID; any other non-root UID works too (docker/README.md).
USER 101:101
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD ["curl", "-fsS", "-o", "/dev/null", "http://127.0.0.1:8080/playback/presentation/2.3/"]
ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
