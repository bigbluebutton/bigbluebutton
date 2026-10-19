# bbb-webrtc-sfu: upstream's image (ghcr.io/bigbluebutton/bbb-webrtc-sfu, built from the
# version pinned in bbb-webrtc-sfu.placeholder.sh) with the bare-metal package's configuration
# changes as one node-config file, so that the Tier 3 override still wins over them. In
# BigBlueButton 4.0 the SFU is LiveKit's controller; its FreeSWITCH adapter is removed.
#
# Build with bake (docker/bake/bbb-webrtc-sfu.hcl):
#   docker buildx bake -f docker-bake.hcl $(printf -- '-f %s ' docker/bake/*.hcl) bbb-webrtc-sfu
# or with podman (--format docker keeps the HEALTHCHECK):
#   podman build --format docker --build-context entrypoint-lib=docker/lib \
#       -t bbb-webrtc-sfu docker/bbb-webrtc-sfu

# ghcr.io/bigbluebutton/bbb-webrtc-sfu:2.25.0-beta.3 (multi-arch index: amd64, arm64), label
# org.opencontainers.image.revision 88cb1a9a1c1cd1ab30ad9a131998cb91ec07980c, the commit of
# tag v2.25.0-beta.3 (bbb-webrtc-sfu.placeholder.sh).
FROM ghcr.io/bigbluebutton/bbb-webrtc-sfu@sha256:f519242efc9629c7fcf0aebf1ca770beed629d95005cd18dcd164d37fe6a8c2e

USER 0
# Upstream ships a copy of default.example.yml at the Tier 3 path; it would override every
# change below. The path stays free for the admin's file, as on bare metal.
RUN rm /etc/bigbluebutton/bbb-webrtc-sfu/production.yml \
    && install -d -m 0755 /usr/local/lib/bbb /usr/local/share/bbb/bbb-webrtc-sfu
# DL3022: entrypoint-lib is a named build context, not a stage.
# hadolint ignore=DL3022
COPY --from=entrypoint-lib --chmod=0644 entrypoint-lib.sh /usr/local/lib/bbb/entrypoint-lib.sh
COPY --chmod=0755 entrypoint.sh /entrypoint.sh
COPY --chmod=0644 healthcheck.js /usr/local/lib/bbb/bbb-webrtc-sfu-healthcheck.js
COPY --chmod=0644 production.yml /usr/local/share/bbb/bbb-webrtc-sfu/production.yml

# Upstream's directories with ours between them: upstream's config < the package's changes <
# Tier 3 (files with the same base name are merged in directory order).
ENV NODE_CONFIG_DIR=/app/config/:/usr/local/share/bbb/bbb-webrtc-sfu/:/etc/bigbluebutton/bbb-webrtc-sfu/
# Container wiring (node-config environment variables): LiveKit controller on, compose
# service names, client WebSocket reachable from nginx.
ENV LIVEKIT_ENABLED=true \
    LIVEKIT_HOST=http://livekit:7880 \
    REDIS_HOST=redis \
    CLIENT_HOST=0.0.0.0

# Upstream's user (webrtc-sfu), numeric so that runAsNonRoot can verify it.
USER 2004:2004
# 3008 client WebSocket (clientPort, proxied by nginx); 3040 LiveKit webhook receiver.
EXPOSE 3008/tcp 3040/tcp
HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=3 \
    CMD ["node", "/usr/local/lib/bbb/bbb-webrtc-sfu-healthcheck.js"]
ENTRYPOINT ["/entrypoint.sh"]
# What upstream's `npm start` runs (package.json scripts.start) and the bare-metal unit's
# ExecStart (bbb-webrtc-sfu.service), without npm: under npm, every stop exits 1 with npm
# errors (the child ends on SIGTERM; its log directory /app/.npm is read-only) and npm checks
# the registry for a newer npm at each run.
CMD ["node", "server.js"]
