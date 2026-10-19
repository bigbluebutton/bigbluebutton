# bbb-webrtc-recorder: upstream's image (ghcr.io/bigbluebutton/bbb-webrtc-recorder, built from
# the version pinned in bbb-webrtc-recorder.placeholder.sh), unchanged, plus an entrypoint that
# merges the Tier 3 override /etc/bigbluebutton/bbb-webrtc-recorder.yml over the packaged
# default. The recorder itself loads exactly one configuration file, so a mounted override
# would otherwise replace the whole default.
#
# Build with bake (docker/bake/bbb-webrtc-recorder.hcl):
#   docker buildx bake -f docker-bake.hcl $(printf -- '-f %s ' docker/bake/*.hcl) bbb-webrtc-recorder
# or with podman (--format docker keeps the HEALTHCHECK):
#   podman build --format docker \
#       --build-context entrypoint-lib=docker/lib \
#       --build-context bbb-yq-go=build/packages-template/bbb-yq-go \
#       -t bbb-webrtc-recorder docker/bbb-webrtc-recorder

# alpine:3.24.1, only to download yq; this stage is not part of the image.
FROM docker.io/library/alpine@sha256:28bd5fe8b56d1bd048e5babf5b10710ebe0bae67db86916198a6eec434943f8b AS yq

ARG TARGETARCH
SHELL ["/bin/ash", "-eo", "pipefail", "-c"]
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
    && wget -q "https://github.com/mikefarah/yq/releases/download/v${yq_version}/${asset}" \
    && grep " ${asset}$" bbb-yq-go.sha256sum | sha256sum -c - \
    && install -m 0755 "$asset" /usr/local/bin/yq


# ghcr.io/bigbluebutton/bbb-webrtc-recorder:0.17.0 (multi-arch index: amd64, arm64), label
# org.opencontainers.image.revision f660264cf4b9568926d23854fab6a5277b857178, the commit of tag
# v0.17.0 (bbb-webrtc-recorder.placeholder.sh). It ships the packaged default
# config/bbb-webrtc-recorder.yml at /etc/bbb-webrtc-recorder/bbb-webrtc-recorder.yml, as the
# bare-metal package does.
FROM ghcr.io/bigbluebutton/bbb-webrtc-recorder@sha256:43b3aab5a3de27890d66f552d31ca42396d25a7c33343266533b758f03f63880

USER 0
# The recordings directory (a volume) and the directory of the merged configuration, writable
# for any UID (docker/README.md); the merged file is written at start.
RUN install -d -m 1777 /var/lib/bbb-webrtc-recorder /run/bbb-webrtc-recorder \
    && install -d -m 0755 /usr/local/lib/bbb /usr/local/share/bbb/bbb-webrtc-recorder
COPY --from=yq /usr/local/bin/yq /usr/local/bin/yq
# DL3022: entrypoint-lib is a named build context, not a stage.
# hadolint ignore=DL3022
COPY --from=entrypoint-lib --chmod=0644 entrypoint-lib.sh /usr/local/lib/bbb/entrypoint-lib.sh
COPY --chmod=0755 entrypoint.sh /entrypoint.sh
COPY --chmod=0755 healthcheck.sh /usr/local/lib/bbb/bbb-webrtc-recorder-healthcheck.sh
COPY --chmod=0644 bbb-webrtc-recorder.yml /usr/local/share/bbb/bbb-webrtc-recorder/bbb-webrtc-recorder.yml

# Upstream's user (bigbluebutton), numeric so that runAsNonRoot can verify it.
USER 998:998
# No listener: the recorder is controlled through redis and connects to LiveKit itself.
HEALTHCHECK --interval=10s --timeout=5s --start-period=15s --retries=3 \
    CMD ["/usr/local/lib/bbb/bbb-webrtc-recorder-healthcheck.sh"]
ENTRYPOINT ["/entrypoint.sh"]
CMD ["bbb-webrtc-recorder", "-c", "/run/bbb-webrtc-recorder/bbb-webrtc-recorder.yml"]
