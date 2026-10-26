FROM node:24-alpine@sha256:44fce696f38ba8c987c4db89954051000bbd05ffd8d8659ba15ed4a8602e937f AS build

COPY --from=mikefarah/yq:4.53.2@sha256:0cb4a78491b6e62ee8a9bf4fbeacbd15b5013d19bc420591b05383a696315e60 /usr/bin/yq /usr/local/bin/yq
# The source at the tag the package builds, cloned by the same script (build/get_external_dependencies.sh)
# hadolint ignore=DL3018
RUN apk add --no-cache git
WORKDIR /usr/local/bigbluebutton
RUN --mount=type=bind,from=placeholders,source=bbb-webhooks.placeholder.sh,target=/placeholder.sh \
    sh /placeholder.sh && rm -rf bbb-webhooks/.git
WORKDIR /usr/local/bigbluebutton/bbb-webhooks
# The package's defaults (after-install.sh) without domain and secret, plus: listen on all interfaces
RUN npm ci --omit=dev && yq '.bbb.auth2_0 = true | .modules."../out/webhooks/index.js".config.getRaw = false \
    | .modules."../out/webhooks/index.js".config.api.bind = "0.0.0.0"' config/default.example.yml > config/default.yml

FROM node:24-alpine@sha256:44fce696f38ba8c987c4db89954051000bbd05ffd8d8659ba15ed4a8602e937f

RUN addgroup -S -g 998 bigbluebutton && adduser -S -u 998 -G bigbluebutton bigbluebutton
COPY --from=build /usr/local/bigbluebutton/bbb-webhooks /usr/local/bigbluebutton/bbb-webhooks
WORKDIR /usr/local/bigbluebutton/bbb-webhooks

# Overrides go to /etc/bigbluebutton/bbb-webhooks/production.yml, as on bare metal (the app sets NODE_CONFIG_DIR itself)
ENV NODE_ENV=production
USER 998:998
EXPOSE 3005
CMD ["node", "app.js"]
HEALTHCHECK CMD ["wget", "-q", "--spider", "http://127.0.0.1:3005/bigbluebutton/api/hooks/ping"]
