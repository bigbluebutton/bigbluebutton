# Learning analytics dashboard: the static build of the bbb-learning-dashboard package, served by
# nginx on port 8080 with the package's location (learning-dashboard.nginx). The edge nginx
# (docker/nginx) proxies /learning-analytics-dashboard/ to it (compose service
# `learning-dashboard`) and serves the per-meeting JSON files from the bbb-data volume itself.
#
# Build with bake (docker/bake/learning-dashboard.hcl) or with podman:
#   podman build --build-context entrypoint-lib=docker/lib bbb-learning-dashboard
#
# Steps as in build/packages-template/bbb-learning-dashboard/build.sh: `npm ci` with the
# devDependencies (webpack lives there) and `npm run build`.

# node:24.22.0-slim (package.json engines: node >= 24)
FROM docker.io/library/node@sha256:a5f4366e834695d5f363b920c104953a535d3a9864d1bdf74566a0ebe01daee5 AS build

WORKDIR /src

COPY package.json package-lock.json ./
RUN npm ci

# The files the webpack build reads (webpack.config.js, postcss.config.js, tailwind.config.js),
# not a local node_modules or build directory.
COPY webpack.config.js postcss.config.js tailwind.config.js ./
COPY public public
COPY src src
RUN npm run build \
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
    && install -d -m 0755 /usr/share/bigbluebutton/nginx /usr/local/lib/bbb

# The package's location fragment at the path it installs it to (build.sh), with one change: the
# app is not at its bare-metal path /var/bigbluebutton/learning-dashboard, which is the bbb-data
# volume in the containers (data only; the edge nginx serves the volume's JSON files). The upstream
# file has CRLF line endings; the edit keeps them. The build fails if it did not apply.
COPY --chmod=0644 learning-dashboard.nginx /usr/share/bigbluebutton/nginx/learning-dashboard.nginx
RUN sed -i 's|^    alias /var/bigbluebutton/learning-dashboard/;|    alias /usr/share/bigbluebutton/learning-dashboard/;|' \
        /usr/share/bigbluebutton/nginx/learning-dashboard.nginx \
    && if ! grep -q '^    alias /usr/share/bigbluebutton/learning-dashboard/;' \
         /usr/share/bigbluebutton/nginx/learning-dashboard.nginx; then \
         echo "learning-dashboard.nginx: upstream fragment changed, edit not applied" >&2; exit 1; \
       fi
COPY --chmod=0644 docker/learning-dashboard.conf /etc/nginx/conf.d/learning-dashboard.conf
COPY --from=build /src/build /usr/share/bigbluebutton/learning-dashboard

# Shared entrypoint helper (P3).
# hadolint ignore=DL3022
COPY --from=entrypoint-lib --chmod=0644 entrypoint-lib.sh /usr/local/lib/bbb/entrypoint-lib.sh
COPY --chmod=0755 docker/entrypoint.sh /entrypoint.sh

# The base image's nginx UID; any other non-root UID works too (docker/README.md).
USER 101:101
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD ["curl", "-fsS", "-o", "/dev/null", "http://127.0.0.1:8080/learning-analytics-dashboard/"]
ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
