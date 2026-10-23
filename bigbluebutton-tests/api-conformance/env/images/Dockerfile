# syntax=docker/dockerfile:1.7
# The Tier 1 stack's images, one target per service. Each unpacks the
# package it runs from the debs (the "debs" context, see compose.yaml)
# instead of installing it: the packages' install scripts need systemd and
# a running database. What those scripts would have set up is done here.

# The LibreOffice the bbb-libreoffice-docker package converts Office
# documents with; make -C env passes the tag bbb-libreoffice/docker/Dockerfile
# names.
ARG LIBREOFFICE_IMAGE=bigbluebutton/bbb-libreoffice:25.8.4.2-20260129-151200
FROM ${LIBREOFFICE_IMAGE} AS libreoffice

# Ubuntu 24.04, as packaged servers run, with the bigbluebutton user every
# image shares, so files on the data volume belong to the same user. Its
# home is where bbb-record-core's install puts it.
FROM ubuntu:24.04 AS base
ENV TZ=UTC LANG=C.UTF-8 DEBIAN_FRONTEND=noninteractive
ARG BBB_UID=2000
RUN apt-get update \
 && apt-get install -y --no-install-recommends ca-certificates curl tzdata \
 && rm -rf /var/lib/apt/lists/* \
 && groupadd -g "$BBB_UID" bigbluebutton \
 && useradd -u "$BBB_UID" -g bigbluebutton -d /home/bigbluebutton -m -s /bin/false bigbluebutton
# unpack PATTERN: unpack the one deb in /debs matching PATTERN into /.
COPY --chmod=755 images/unpack /usr/local/bin/unpack

# Creates the data directory tree as bbb-config, bbb-record-core and
# bbb-web do at install, then exits.
FROM base AS init
COPY --chmod=755 images/init/init-data /usr/local/bin/init-data
CMD ["init-data"]

# bbb-web: the exploded war, started as bbb-web.service starts it.
FROM base AS bbb-web
# The package's Depends (opts-noble.sh), minus the bbb-* and redis ones,
# plus the converters' tools that a default install pulls in as
# Recommends (poppler, ghostscript); bbb-libreoffice-docker's fonts, which
# its converter uses from the host; and the libraries LibreOffice needs
# that its image installs.
RUN apt-get update \
 && apt-get install -y --no-install-recommends openjdk-21-jre-headless zip unzip imagemagick \
      libmagickcore-6.q16-7-extra poppler-utils ghostscript psmisc fonts-crosextra-carlito \
      fonts-crosextra-caladea fonts-noto file potrace \
      fonts-arkpandora fonts-noto-cjk fonts-liberation \
      libcairo2 libx11-xcb1 libxinerama1 libxslt1.1 libxt6 \
 && rm -rf /var/lib/apt/lists/*
COPY --from=libreoffice /opt/ /opt/
COPY --chmod=755 images/bbb-web/convert.sh /usr/share/bbb-libreoffice-conversion/convert.sh
RUN missing=$(ldd /opt/libreoffice*/program/soffice.bin /opt/libreoffice*/program/libmergedlo.so | grep 'not found' || true) \
 && if [ -n "$missing" ]; then echo "LibreOffice is missing: $missing" >&2; exit 1; fi
RUN --mount=type=bind,from=debs,target=/debs unpack 'bbb-web_*.deb' \
 # What after-install.sh does to the packaged properties, but the host and
 # salt, which the stack's /etc/bigbluebutton/bbb-web.properties sets.
 && props=/usr/share/bbb-web/WEB-INF/classes/bigbluebutton.properties \
 && sed -i -e 's/placementsThreshold=8000/placementsThreshold=800/g' \
      -e 's/imageTagThreshold=8000/imageTagThreshold=800/g' \
      -e 's#<a href="event:http://www.bigbluebutton.org/html5">#<a href="https://www.bigbluebutton.org/html5" target="_blank">#g' \
      -e 's#<a href="http://docs.bigbluebutton.org/" target="_blank">#<a href="https://docs.bigbluebutton.org/" target="_blank">#g' \
      "$props" \
 && mkdir -p /var/log/bigbluebutton && chown bigbluebutton: /var/log/bigbluebutton \
 && rm -rf /usr/share/bbb-web/logs && ln -s /var/log/bigbluebutton /usr/share/bbb-web/logs
# Files other packages install that bbb-web reads: the release (bbb-config),
# the blank slides and nopdfmark.ps (bbb-config), and the client settings
# (bbb-html5).
COPY --from=config bigbluebutton-release slides/nopdfmark.ps /etc/bigbluebutton/
COPY --from=config slides/blank-png.png slides/blank-svg.svg slides/blank-thumb.png /usr/share/bigbluebutton/blank/
COPY --from=html5config settings.yml /usr/share/bigbluebutton/html5-client/private/config/settings.yml
# The converters run through run-in-systemd.sh, which needs a systemd user
# session. This one applies the timeout only: no memory limit or sandbox.
COPY --chmod=755 images/bbb-web/run-in-systemd.sh /usr/share/bbb-web/run-in-systemd.sh
# The stack's rendered configuration is mounted at /etc/bigbluebutton/conform;
# a profile switch rewrites the file there.
RUN ln -s conform/bbb-web.properties /etc/bigbluebutton/bbb-web.properties
COPY --chmod=755 images/bbb-web/start /usr/local/bin/start-bbb-web
CMD ["start-bbb-web"]
HEALTHCHECK --interval=5s --timeout=5s --start-period=180s \
  CMD curl -fsS http://127.0.0.1:8090/bigbluebutton/api | grep -q SUCCESS

# akka-apps, started as bbb-apps-akka.service starts it.
FROM base AS akka-apps
RUN apt-get update \
 && apt-get install -y --no-install-recommends openjdk-21-jre-headless \
 && rm -rf /var/lib/apt/lists/*
RUN --mount=type=bind,from=debs,target=/debs unpack 'bbb-apps-akka_*.deb' \
 && mkdir -p /var/log/bbb-apps-akka && chown bigbluebutton: /var/log/bbb-apps-akka
COPY --from=html5config settings.yml /usr/share/bigbluebutton/html5-client/private/config/settings.yml
# akka-apps reads bbb-web's properties too, for one setting.
RUN mkdir -p /etc/bigbluebutton \
 && ln -s conform/bbb-apps-akka.conf /etc/bigbluebutton/bbb-apps-akka.conf \
 && ln -s conform/bbb-web.properties /etc/bigbluebutton/bbb-web.properties
COPY --chmod=755 images/akka-apps/start /usr/local/bin/start-akka-apps
CMD ["start-akka-apps"]
HEALTHCHECK --interval=5s --timeout=5s --start-period=120s \
  CMD curl -fsS http://127.0.0.1:8901/healthz

# The GraphQL server's files: the schema and Hasura's metadata and binaries.
FROM base AS graphql-server-files
RUN --mount=type=bind,from=debs,target=/debs unpack 'bbb-graphql-server_*.deb'

# Postgres 16, as the bbb-graphql-server package requires, with the
# databases and roles its install script creates.
FROM postgres:16 AS postgres
ENV TZ=UTC
COPY --from=graphql-server-files /usr/share/bbb-graphql-server/bbb_schema.sql /docker-entrypoint-initdb.d/bbb_schema.sql.in
COPY --chmod=755 images/postgres/10-bbb-graphql.sh /docker-entrypoint-initdb.d/10-bbb-graphql.sh
HEALTHCHECK --interval=2s --timeout=5s --start-period=60s \
  CMD pg_isready -h 127.0.0.1 -U postgres -d bbb_graphql

# Hasura, as bbb-graphql-server@.service runs it: the engine BBB builds
# (from its fork), with the libraries the package depends on, and BBB's
# metadata applied at start. netbase, which every server has, gives the
# engine's HTTP client the tcp protocol (/etc/protocols) for its webhook.
FROM base AS hasura
RUN apt-get update \
 && apt-get install -y --no-install-recommends libkrb5-3 libpq5 libnuma1 unixodbc-dev netbase \
 && rm -rf /var/lib/apt/lists/*
RUN --mount=type=bind,from=debs,target=/debs unpack 'bbb-graphql-server_*.deb' \
 && chmod -R 755 /usr/share/bbb-graphql-server \
 && if ldd /usr/bin/hasura-graphql-engine | grep 'not found'; then exit 1; fi
COPY --chmod=755 images/hasura/start /usr/local/bin/start-hasura
CMD ["start-hasura"]
HEALTHCHECK --interval=2s --timeout=5s --start-period=120s \
  CMD test -f /tmp/hasura-ready && curl -fsS -o /dev/null http://127.0.0.1:8085/healthz

# The GraphQL middleware, as bbb-graphql-middleware.service runs it.
FROM base AS middleware
RUN --mount=type=bind,from=debs,target=/debs unpack 'bbb-graphql-middleware_*.deb'
COPY graphql/bbb-graphql-middleware.yml /etc/bigbluebutton/bbb-graphql-middleware.yml
USER bigbluebutton
WORKDIR /usr/bin
CMD ["/usr/bin/bbb-graphql-middleware"]
# Its port opens once its redis subscription is up.
HEALTHCHECK --interval=2s --timeout=5s --start-period=60s \
  CMD curl -fsS -o /dev/null http://127.0.0.1:8378/metrics

# The GraphQL actions server, as bbb-graphql-actions.service runs it, on
# Node 24 as the package requires.
FROM node:24-bookworm-slim AS node
FROM base AS actions
COPY --from=node /usr/local/bin/node /usr/local/bin/node
RUN --mount=type=bind,from=debs,target=/debs unpack 'bbb-graphql-actions_*.deb'
USER bigbluebutton
WORKDIR /usr/local/bigbluebutton/bbb-graphql-actions
ENV NODE_ENV=production
CMD ["node", "bbb-graphql-actions.js"]
# Any answer will do: it serves only the actions' POSTs.
HEALTHCHECK --interval=2s --timeout=5s --start-period=60s \
  CMD curl -sS -o /dev/null http://127.0.0.1:8093/

# The suite's tap (bbb-conform tap), built from the runner in this tree.
FROM golang:1.26 AS tap-build
WORKDIR /src
COPY --from=runner go.mod go.sum ./
RUN go mod download
COPY --from=runner . .
RUN CGO_ENABLED=0 go build -o /bbb-conform ./cmd/bbb-conform

# Follows the bus and reads redis and the data directory for the bus, redis
# and fs steps. It only reads.
FROM base AS tap
COPY --from=tap-build /bbb-conform /usr/local/bin/bbb-conform
USER bigbluebutton
CMD ["bbb-conform", "tap", "--listen", "0.0.0.0:8099"]
HEALTHCHECK --interval=2s --timeout=5s --start-period=30s \
  CMD curl -fsS http://127.0.0.1:8099/info | grep -q '"subscribed":true'

# nginx as Ubuntu 24.04 packages it, with the packages' nginx files:
# bbb-web's locations, and the middleware's /graphql location, its cache
# zone and the Hasura load balancer on 127.0.0.1:8185.
FROM base AS nginx
RUN apt-get update \
 && apt-get install -y --no-install-recommends nginx \
 && rm -rf /var/lib/apt/lists/* /etc/nginx/sites-enabled/default
RUN --mount=type=bind,from=debs,target=/debs \
    mkdir /tmp/web /tmp/middleware \
 && UNPACK_TO=/tmp/web unpack 'bbb-web_*.deb' \
 && UNPACK_TO=/tmp/middleware unpack 'bbb-graphql-middleware_*.deb' \
 && mkdir -p /usr/share/bigbluebutton/nginx \
 && cp -a /tmp/web/usr/share/bigbluebutton/nginx/. /tmp/middleware/usr/share/bigbluebutton/nginx/. \
      /usr/share/bigbluebutton/nginx/ \
 && ln -s /usr/share/bigbluebutton/nginx/web /usr/share/bigbluebutton/nginx/web.nginx \
 && cp -a /tmp/middleware/etc/nginx/. /etc/nginx/ \
 && ln -s /etc/nginx/sites-available/hasura-loadbalancer.conf /etc/nginx/sites-enabled/hasura-loadbalancer.conf \
 && rm -rf /tmp/web /tmp/middleware
COPY --from=config assets/ /var/www/bigbluebutton-default/assets/
COPY nginx/bigbluebutton.conf /etc/nginx/sites-enabled/bigbluebutton
CMD ["nginx", "-g", "daemon off;"]
HEALTHCHECK --interval=2s --timeout=5s --start-period=30s \
  CMD curl -fsS --cacert /etc/bigbluebutton/conform/certs/ca.crt https://localhost:8443/default.pdf -o /dev/null
