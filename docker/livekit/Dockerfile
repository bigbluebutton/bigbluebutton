# livekit-server as BigBlueButton packages it (bbb-livekit): LiveKit v1.13.7 built from source
# with the psrpc patch of build/packages-template/bbb-livekit/build.sh.
#
# Build with bake (docker/bake/livekit.hcl defines the named contexts):
#   docker buildx bake -f docker-bake.hcl $(printf -- '-f %s ' docker/bake/*.hcl) livekit
# or with podman (--format docker keeps the HEALTHCHECK):
#   podman build --format docker \
#       --build-context entrypoint-lib=docker/lib \
#       --build-context bbb-livekit=build/packages-template/bbb-livekit \
#       --build-context bbb-yq-go=build/packages-template/bbb-yq-go \
#       -t bbb-livekit docker/livekit
#
# Both bases are the ones LiveKit's own Dockerfile pins at v1.13.7 (builder and runtime).

# golang:1.26.7-alpine3.24
FROM docker.io/library/golang@sha256:28d89ee9cc0ff9fec75c82ca201e6bf7fdf9a679d4b7b24dfa04f2bb766bb468 AS build

ARG TARGETARCH
# Module github.com/livekit/livekit-server@v1.13.7 is commit 8d11efdfcd; its hash is also
# checked against sum.golang.org by `go mod download`.
ARG LIVEKIT_VERSION=v1.13.7
ARG LIVEKIT_MODULE_SUM=h1:PqXwz9vbVPjDqUkhNvwxTc082+/h01mbZCBJ4zRmPh4=

# Use exactly this toolchain (as LiveKit's Dockerfile does) and build a static binary.
ENV GOTOOLCHAIN=local \
    CGO_ENABLED=0

SHELL ["/bin/ash", "-eo", "pipefail", "-c"]

# Build tools only; this stage is not part of the image.
RUN apk add --no-cache jq patch

WORKDIR /build
RUN go mod download -json "github.com/livekit/livekit-server@${LIVEKIT_VERSION}" >livekit-module.json \
    && jq -e --arg sum "$LIVEKIT_MODULE_SUM" '.Sum == $sum' livekit-module.json \
    && cp -r "$(jq -er .Dir livekit-module.json)" /build/livekit \
    && chmod -R u+w /build/livekit

# psrpc patch, as upstream applies it (build/packages-template/bbb-livekit/build.sh). The
# replaced psrpc is downloaded by version and checked against livekit's go.sum.
# DL3022: bbb-livekit is a named build context, not a stage.
# hadolint ignore=DL3022
COPY --from=bbb-livekit closed-channel-loop_psrpc.patch /build/
WORKDIR /build/livekit
RUN grep -qE '^[[:space:]]+github.com/livekit/psrpc v0\.7\.7$' go.mod || { \
        echo "livekit no longer requires psrpc v0.7.7, which the psrpc patch is made for." >&2; \
        exit 1; \
    } \
    && psrpc_dir="$(go mod download -json github.com/livekit/psrpc@v0.7.7 | jq -er .Dir)" \
    && mkdir -p third_party \
    && cp -r "$psrpc_dir" third_party/psrpc \
    && chmod -R u+w third_party/psrpc \
    && patch -d third_party/psrpc -p1 --forward --fuzz=0 --dry-run -i /build/closed-channel-loop_psrpc.patch \
    && patch -d third_party/psrpc -p1 --forward --fuzz=0 -i /build/closed-channel-loop_psrpc.patch \
    && patched="$(grep -rE '(requests|claims) = nil$' third_party/psrpc/pkg/server | wc -l)" \
    && { [ "$patched" -eq 4 ] || { echo "closed-channel-loop_psrpc.patch did not apply" >&2; exit 1; }; } \
    && go mod edit -replace github.com/livekit/psrpc=./third_party/psrpc

# Upstream builds with `mage`, which regenerates pkg/service/wire_gen.go and runs `go build`
# in cmd/server. Regenerate it here too and require the committed file, then build, without
# the symbol table and DWARF data (-s -w; panics still print stack traces).
# DL3062: wire's version is pinned by livekit's go.mod and go.sum.
# hadolint ignore=DL3062
RUN cp pkg/service/wire_gen.go /tmp/wire_gen.go \
    && go run github.com/google/wire/cmd/wire gen ./pkg/service \
    && cmp /tmp/wire_gen.go pkg/service/wire_gen.go \
    && go build -trimpath -ldflags "-s -w" -o /build/livekit-server ./cmd/server \
    && go version -m /build/livekit-server | grep -A1 -F 'github.com/livekit/psrpc' \
    && /build/livekit-server --version

# yq as upstream packages it (bbb-yq-go): version from its build.sh, verified against its
# checksum file (amd64 and arm64).
# hadolint ignore=DL3022
COPY --from=bbb-yq-go build.sh bbb-yq-go.sha256sum /build/yq/
WORKDIR /build/yq
RUN case "$TARGETARCH" in \
        amd64|arm64) asset="yq_linux_${TARGETARCH}" ;; \
        *) echo "bbb-yq-go.sha256sum has no entry for $TARGETARCH" >&2; exit 1 ;; \
    esac \
    && yq_version="$(sed -n 's/^YQ_VERSION=//p' build.sh)" \
    && wget -q "https://github.com/mikefarah/yq/releases/download/v${yq_version}/${asset}" \
    && grep " ${asset}$" bbb-yq-go.sha256sum | sha256sum -c - \
    && install -m 0755 "$asset" /usr/local/bin/yq

# alpine:3.24.1
FROM docker.io/library/alpine@sha256:28bd5fe8b56d1bd048e5babf5b10710ebe0bae67db86916198a6eec434943f8b

# bash for the entrypoint helper; the healthcheck uses busybox wget. The directories of the
# files copied below, traversable by any UID (docker/README.md).
RUN apk add --no-cache bash \
    && install -d -m 0755 /usr/share/livekit-server /usr/local/share/bbb/livekit /usr/local/lib/bbb

COPY --from=build /usr/local/bin/yq /usr/local/bin/yq
COPY --from=build /build/livekit-server /usr/bin/livekit-server
# The packaged default, unchanged, at its bare-metal path; the container wiring is merged
# over it at start. DL3022: bbb-livekit and entrypoint-lib are named build contexts.
# hadolint ignore=DL3022
COPY --from=bbb-livekit --chmod=0644 livekit.yaml /usr/share/livekit-server/livekit.yaml
COPY --chmod=0644 livekit.yaml /usr/local/share/bbb/livekit/livekit.yaml
# hadolint ignore=DL3022
COPY --from=entrypoint-lib --chmod=0644 entrypoint-lib.sh /usr/local/lib/bbb/entrypoint-lib.sh
COPY --chmod=0755 entrypoint.sh /entrypoint.sh

# The entrypoint renders /run/livekit-server/livekit.yaml (the unit's RuntimeDirectory) as any
# UID/GID.
RUN install -d -m 1777 /run/livekit-server

USER 998:998
# 7880 HTTP/WebSocket signaling and API; 7882/udp WebRTC media (LIVEKIT_RTC_UDP_PORT).
EXPOSE 7880/tcp 7882/udp
HEALTHCHECK --interval=10s --timeout=3s --start-period=15s --retries=3 \
    CMD ["wget", "-q", "-O", "/dev/null", "http://127.0.0.1:7880/"]
ENTRYPOINT ["/entrypoint.sh"]
CMD ["livekit-server", "--config", "/run/livekit-server/livekit.yaml"]
