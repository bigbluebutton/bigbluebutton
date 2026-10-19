# bbb-graphql-middleware as BigBlueButton packages it (build/packages-template/bbb-graphql-middleware):
# the Go binary at /usr/bin/bbb-graphql-middleware and the shipped config/config.yml at
# /usr/share/bbb-graphql-middleware/config.yml, with the loopback addresses replaced by the
# container service names. /etc/bigbluebutton/bbb-graphql-middleware.yml stays the Tier 3
# override; the binary merges it itself (config/Config.go).
#
# Build with bake (docker/bake/graphql-middleware.hcl):
#   docker buildx bake -f docker-bake.hcl $(printf -- '-f %s ' docker/bake/*.hcl) graphql-middleware
# or with podman (--format docker keeps the HEALTHCHECK):
#   podman build --format docker \
#       --build-context entrypoint-lib=docker/lib \
#       --build-context bbb-yq-go=build/packages-template/bbb-yq-go \
#       -t bbb-graphql-middleware bbb-graphql-middleware

# golang:1.27.2-alpine3.24 (go.mod requires go 1.27.0). Runs on the build platform and
# cross-compiles, so the stage needs no emulation.
FROM --platform=$BUILDPLATFORM docker.io/library/golang@sha256:f92b6ef800e499660581efdabdf25d9d817a9d124eaf900924f0504e7e27e12d AS build

ARG TARGETOS
ARG TARGETARCH
ENV GOTOOLCHAIN=local

WORKDIR /src
# Modules are verified against go.sum.
COPY go.mod go.sum ./
RUN go mod download

COPY cmd/ cmd/
COPY config/ config/
COPY internal/ internal/
# Same build command as build/packages-template/bbb-graphql-middleware/build.sh, without the
# symbol table and DWARF data (-s -w; panics still print stack traces).
RUN CGO_ENABLED=0 GOOS="$TARGETOS" GOARCH="$TARGETARCH" \
        go build -ldflags "-s -w" -o bbb-graphql-middleware cmd/bbb-graphql-middleware/main.go


# alpine:3.24.1. The config is the same on every architecture, so this stage runs on the
# build platform and needs a yq binary for BUILDARCH (not TARGETARCH).
FROM --platform=$BUILDPLATFORM docker.io/library/alpine@sha256:28bd5fe8b56d1bd048e5babf5b10710ebe0bae67db86916198a6eec434943f8b AS config

ARG BUILDARCH
SHELL ["/bin/ash", "-eo", "pipefail", "-c"]

# yq as upstream packages it (bbb-yq-go): version from its build.sh, verified against its
# checksum file (amd64 and arm64).
# DL3022: bbb-yq-go is a named build context, not a stage.
# hadolint ignore=DL3022
COPY --from=bbb-yq-go build.sh bbb-yq-go.sha256sum /build/yq/
WORKDIR /build/yq
RUN case "$BUILDARCH" in \
        amd64|arm64) asset="yq_linux_${BUILDARCH}" ;; \
        *) echo "bbb-yq-go.sha256sum has no entry for $BUILDARCH" >&2; exit 1 ;; \
    esac \
    && yq_version="$(sed -n 's/^YQ_VERSION=//p' build.sh)" \
    && wget -q "https://github.com/mikefarah/yq/releases/download/v${yq_version}/${asset}" \
    && grep " ${asset}$" bbb-yq-go.sha256sum | sha256sum -c - \
    && install -m 0755 "$asset" /usr/local/bin/yq

# Container wiring: only the addresses change, keys, comments and all other values stay as
# shipped. listen_host 0.0.0.0, because nginx (/graphql) and akka-apps connect from other
# containers. Hasura is reached directly on its own port 8085; on bare metal 8185 is the nginx
# load balancer in front of it (hasura-loadbalancer.nginx), which compose replaces by one
# service name. The build fails if a loopback address is left, e.g. after an upstream change.
WORKDIR /build/config
COPY config/config.yml config.yml
RUN yq -i ' \
        .server.listen_host = "0.0.0.0" \
        | .redis.host = "redis" \
        | .hasura.url |= sub("//127[.]0[.]0[.]1:8185/", "//graphql-server:8085/") \
        | .["graphql-actions"].url |= sub("//127[.]0[.]0[.]1:8093$", "//graphql-actions:8093") \
        | .auth_hook.url |= sub("//127[.]0[.]0[.]1:8090/", "//bbb-web:8090/") \
        | .session_vars_hook.url |= sub("//127[.]0[.]0[.]1:8901/", "//akka-apps:8901/") \
    ' config.yml \
    && if grep -nE '127[.]0[.]0[.]1|localhost' config.yml; then \
        echo "config.yml: loopback address left after the container wiring" >&2; exit 1; \
    fi


# alpine:3.24.1
FROM docker.io/library/alpine@sha256:28bd5fe8b56d1bd048e5babf5b10710ebe0bae67db86916198a6eec434943f8b

# bash for the entrypoint helper; the healthcheck uses busybox wget.
RUN apk add --no-cache bash

COPY --from=build /src/bbb-graphql-middleware /usr/bin/bbb-graphql-middleware
# Directories of the files below, traversable by any UID (docker/README.md).
RUN install -d -m 0755 /usr/share/bbb-graphql-middleware /usr/local/lib/bbb
COPY --from=config --chmod=0644 /build/config/config.yml /usr/share/bbb-graphql-middleware/config.yml
# DL3022: entrypoint-lib is a named build context, not a stage.
# hadolint ignore=DL3022
COPY --from=entrypoint-lib --chmod=0644 entrypoint-lib.sh /usr/local/lib/bbb/entrypoint-lib.sh
COPY --chmod=0755 docker/entrypoint.sh /entrypoint.sh

# The unit runs it as bigbluebutton; here any non-root UID works (nothing is written).
USER 998:998
EXPOSE 8378
# /metrics is served on the listen port (cmd/bbb-graphql-middleware/main.go).
HEALTHCHECK --interval=10s --timeout=3s --start-period=10s --retries=3 \
    CMD ["wget", "-q", "-O", "/dev/null", "http://127.0.0.1:8378/metrics"]
ENTRYPOINT ["/entrypoint.sh"]
CMD ["bbb-graphql-middleware"]
