# html5 client: the static build of the bbb-html5 package, served by nginx on port 8080 with the
# package's own locations (bbb-html5.nginx, bbb-html5.nginx.static). The edge nginx
# (docker/nginx) proxies /html5client to it (compose service `html5`). akka-apps and bbb-web take
# the build's settings.yml from this image (docker/bake/apps-akka.hcl, web.hcl).
#
# Build with bake (docker/bake/html5-client.hcl) or with podman:
#   podman build --build-context bbb-config=bigbluebutton-config \
#     --build-context packages=build/packages-template \
#     --build-context entrypoint-lib=docker/lib bigbluebutton-html5
#
# Steps as in build/packages-template/bbb-html5/build.sh and after-install.sh; see the
# comments below for the lines each step follows.

# node:24.22.0-slim (package.json engines: node >= 24)
FROM docker.io/library/node@sha256:a5f4366e834695d5f363b920c104953a535d3a9864d1bdf74566a0ebe01daee5 AS build

WORKDIR /src

COPY package.json package-lock.json ./
RUN CI=true npm ci

# build.sh: npm build. The settings.yml edits below come after it (on the copy webpack puts
# into dist/private, CopyPlugin in webpack.config.js; the bundles do not read the file), so that
# a new build identifier or release does not rebuild the client.
COPY . .
RUN DISABLE_ESLINT_PLUGIN=true npm run build-safari && npm run build

# Client build identifier, as in build.sh: COMMIT_DATE if set (bake variable COMMIT_DATE,
# docker/README.md "Building"), else the numeric BUILD (0 if neither is set).
ARG COMMIT_DATE=""
ARG BUILD=""
# After the ARGs: hadolint 2.15 forgets a SHELL that comes before an ARG.
SHELL ["/bin/bash", "-o", "pipefail", "-c"]

# DL3022: bbb-config is a named build context (./bigbluebutton-config), not a stage.
# hadolint ignore=DL3022
COPY --from=bbb-config bigbluebutton-release /tmp/bigbluebutton-release

# build.sh: settings.yml build id, safari bundle renaming and the ?v= cache buster.
# after-install.sh: public.app.bbbServerVersion from /etc/bigbluebutton/bigbluebutton-release
# (bbb-config). sed instead of upstream's `yq-go e -i`, which would rewrite the whole file's
# formatting.
# These edits come after webpack has written the precompressed .gz copies (CompressionPlugin in
# webpack.config.js), and bbb-html5.nginx.static serves those copies (gzip_static on): each .gz
# whose content no longer matches its file is written again, so browsers get the build
# identifier as cache buster. A .gz file without a sibling is the compressed copy of a safari
# bundle under its name before the renaming; nginx never serves it (try_files looks for the
# uncompressed name, which no longer exists), so it is removed. The
# build fails if a placeholder is left in a served file (the JS bundles keep their
# own built-in defaults, which settings.yml overrides).
WORKDIR /src/dist
RUN CLIENT_BUILD="${COMMIT_DATE:-$((BUILD))}" \
    && sed -i "s/HTML5_CLIENT_VERSION/${CLIENT_BUILD}/g" private/config/settings.yml \
    && BBB_FULL_VERSION="$(sed -n '/^BIGBLUEBUTTON_RELEASE/{s/.*=//;p}' /tmp/bigbluebutton-release | tail -n 1)" \
    && sed -i "s/^\(    bbbServerVersion: \)HTML5_FULL_BBB_VERSION\$/\1${BBB_FULL_VERSION}/" private/config/settings.yml \
    && HASH="$(find . -maxdepth 1 -name 'bundle.*.js' -printf '%f\n' | grep -Eo 'bundle\.[a-f0-9]{20}\.js' | head -n 1 | grep -Eo '[a-f0-9]{20}' || true)" \
    && if [ -z "$HASH" ]; then \
         echo "Bundle hash not found."; \
       else \
         for FILE in *.safari.js *.safari.js.map; do \
           if [[ "$FILE" == *"$HASH"* ]]; then continue; fi; \
           PREFIX="${FILE%%.safari.js*}"; \
           SUFFIX="${FILE#*.safari.js}"; \
           mv "$FILE" "${PREFIX}.${HASH}.safari.js${SUFFIX}"; \
         done; \
       fi \
    && sed -i "s/?v=VERSION/?v=${CLIENT_BUILD}/g" index.html stylesheets/fonts.css \
    && find . -type f -name '*.gz' | while IFS= read -r gz; do \
         f="${gz%.gz}"; \
         if [ ! -f "$f" ]; then \
           rm -- "$gz" || exit 1; \
         elif ! gzip -dc "$gz" | cmp -s - "$f"; then \
           gzip -9 -n -c "$f" >"$gz" || exit 1; \
         fi; \
       done \
    && left="$(find . -type f \( \
                 \( -name '*.gz' -exec sh -c 'gzip -dc "$1" | grep -qF "?v=VERSION"' _ {} \; \) \
                 -o \( ! -name '*.gz' -exec grep -qF '?v=VERSION' {} \; \) \) -print)" \
    && if grep -q 'HTML5_CLIENT_VERSION\|HTML5_FULL_BBB_VERSION' private/config/settings.yml; then \
         left="$left private/config/settings.yml"; fi \
    && if gzip -dc private/config/settings.yml.gz | grep 'HTML5_CLIENT_VERSION\|HTML5_FULL_BBB_VERSION' >/dev/null; then \
         left="$left private/config/settings.yml.gz"; fi \
    && if [ -n "$left" ]; then \
         echo "html5 client: version placeholder left in:$left" >&2; exit 1; \
       fi \
    && chmod -R a+rX,go-w /src/dist

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
    && install -d -m 0755 /usr/share/bigbluebutton/nginx /usr/local/lib/bbb

# The package's location fragments at the paths it installs them to (build.sh), unchanged.
# bbb-html5.nginx.dev (a proxy to a local development server) is not shipped.
# DL3022: packages is a named build context (./build/packages-template), not a stage.
# hadolint ignore=DL3022
COPY --from=packages --chmod=0644 bbb-html5/bbb-html5.nginx bbb-html5/bbb-html5.nginx.static \
     /usr/share/bigbluebutton/nginx/
COPY --chmod=0644 docker/html5-client.conf /etc/nginx/conf.d/html5-client.conf
COPY --from=build /src/dist /usr/share/bigbluebutton/html5-client

# Shared entrypoint helper (P3).
# hadolint ignore=DL3022
COPY --from=entrypoint-lib --chmod=0644 entrypoint-lib.sh /usr/local/lib/bbb/entrypoint-lib.sh
COPY --chmod=0755 docker/entrypoint.sh /entrypoint.sh

# The base image's nginx UID; any other non-root UID works too (docker/README.md).
USER 101:101
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD ["curl", "-fsS", "-o", "/dev/null", "http://127.0.0.1:8080/html5client/"]
ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
