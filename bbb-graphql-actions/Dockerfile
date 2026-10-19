# bbb-graphql-actions as BigBlueButton packages it (build/packages-template/bbb-graphql-actions):
# the compiled server in /usr/local/bigbluebutton/bbb-graphql-actions, started by node like the
# systemd unit does. It reads only environment variables (src/config.ts), so there is no
# entrypoint script: nothing is validated or rendered.
#
# Build with bake (docker/bake/graphql-actions.hcl):
#   docker buildx bake -f docker-bake.hcl $(printf -- '-f %s ' docker/bake/*.hcl) graphql-actions
# or with podman (--format docker keeps the HEALTHCHECK):
#   podman build --format docker -t bbb-graphql-actions bbb-graphql-actions

# node:24.22.0-slim (the package depends on nodejs >= 24, << 25)
FROM docker.io/library/node@sha256:a5f4366e834695d5f363b920c104953a535d3a9864d1bdf74566a0ebe01daee5 AS build

# Same steps as build/packages-template/bbb-graphql-actions/build.sh: compile, then install the
# production dependencies next to the renamed bbb-graphql-actions.js.
WORKDIR /build/src
COPY package.json package-lock.json tsconfig.json ./
COPY src/ src/
RUN npm ci --no-progress \
    && npm run build

WORKDIR /build/bbb-graphql-actions
RUN mv ../src/dist/* . \
    && mv index.js bbb-graphql-actions.js \
    && cp ../src/package.json ../src/package-lock.json . \
    && npm ci --no-progress --omit=dev \
    && npm cache clean --force


# node:24.22.0-slim
FROM docker.io/library/node@sha256:a5f4366e834695d5f363b920c104953a535d3a9864d1bdf74566a0ebe01daee5

# tini as PID 1: node as PID 1 ignores SIGTERM (the server installs no handler), so stopping
# the container would wait for SIGKILL. Under systemd node is not PID 1 and SIGTERM ends it.
RUN apt-get update \
    && apt-get install -y --no-install-recommends tini \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build /build/bbb-graphql-actions /usr/local/bigbluebutton/bbb-graphql-actions

# NODE_ENV as in the systemd unit. BBB_REDIS_HOST and SERVER_HOST replace the loopback defaults
# of src/config.ts: redis is its own service, and Hasura (graphql-server) connects from its own
# container. All can be overridden at run time.
ENV NODE_ENV=production \
    BBB_REDIS_HOST=redis \
    SERVER_HOST=0.0.0.0

# The unit runs it as bigbluebutton; here any non-root UID works (nothing is written).
USER 998:998
WORKDIR /usr/local/bigbluebutton/bbb-graphql-actions
EXPOSE 8093
# The server answers only POST /; any HTTP response (404 for GET /) shows that it is up.
HEALTHCHECK --interval=10s --timeout=3s --start-period=10s --retries=3 \
    CMD ["node", "-e", "fetch('http://127.0.0.1:' + (process.env.SERVER_PORT || 8093) + '/').then(() => process.exit(0), () => process.exit(1))"]
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["node", "bbb-graphql-actions.js"]
