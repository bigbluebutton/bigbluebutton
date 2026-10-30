FROM node:24-slim@sha256:55fb5f5a527ea2c5c4a95f963e48ef90aa38c7b346054fdc8ee9957a2b55d205 AS build

# mediasoup builds its worker from source; some dependencies are git URLs
# hadolint ignore=DL3008
RUN apt-get update && apt-get install -y --no-install-recommends build-essential ca-certificates git python3 python3-pip \
 && rm -rf /var/lib/apt/lists/*
COPY --from=mikefarah/yq:4.53.2@sha256:0cb4a78491b6e62ee8a9bf4fbeacbd15b5013d19bc420591b05383a696315e60 /usr/bin/yq /usr/local/bin/yq

# The source at the tag the package builds, cloned by the same script (build/get_external_dependencies.sh)
WORKDIR /usr/local/bigbluebutton
RUN --mount=type=bind,from=placeholders,source=bbb-webrtc-sfu.placeholder.sh,target=/placeholder.sh \
    sh /placeholder.sh
WORKDIR /usr/local/bigbluebutton/bbb-webrtc-sfu
# Always build the mediasoup worker from source instead of fetching a prebuilt binary
ENV MEDIASOUP_SKIP_WORKER_PREBUILT_DOWNLOAD=true
# Drop the clone's history and the worker's build objects as the package does
RUN npm install --unsafe-perm --omit=dev && rm -rf .git \
    node_modules/mediasoup/worker/out/Release/subprojects \
    node_modules/mediasoup/worker/out/Release/mediasoup-worker.p \
    node_modules/mediasoup/worker/out/Release/deps
# The package's defaults (after-install.sh) without the host IPs, plus: listen on all interfaces, log to stdout only
RUN yq '.mediasoup.workerBalancing.strategy = "least-loaded" | .mediasoup.enableWorkerTransposing = true \
    | .mediasoup.dedicatedMediaTypeWorkers.audio = "auto" | .recordWebcams = true \
    | .recordingAdapter = "bbb-webrtc-recorder" | .kurento = [] | .mcs-address = "127.0.0.1" | .livekit.enabled = true \
    | .clientHost = "0.0.0.0" | .log.file = false' config/default.example.yml > config/default.yml

FROM node:24-slim@sha256:55fb5f5a527ea2c5c4a95f963e48ef90aa38c7b346054fdc8ee9957a2b55d205

RUN groupadd -g 998 bigbluebutton && useradd -u 998 -g 998 -m bigbluebutton
COPY --from=build /usr/local/bigbluebutton/bbb-webrtc-sfu /usr/local/bigbluebutton/bbb-webrtc-sfu
WORKDIR /usr/local/bigbluebutton/bbb-webrtc-sfu

# Overrides go to /etc/bigbluebutton/bbb-webrtc-sfu/production.yml, as on bare metal
ENV NODE_ENV=production \
    NODE_CONFIG_DIR=/etc/bigbluebutton/bbb-webrtc-sfu/:/usr/local/bigbluebutton/bbb-webrtc-sfu/config/ \
    ALLOW_CONFIG_MUTATIONS=true
USER 998:998
EXPOSE 3008
CMD ["node", "server.js"]
