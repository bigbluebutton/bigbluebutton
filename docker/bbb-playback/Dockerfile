FROM node:24-alpine@sha256:44fce696f38ba8c987c4db89954051000bbd05ffd8d8659ba15ed4a8602e937f AS build

# The source at the tag the package builds, cloned by the same script (build/get_external_dependencies.sh)
# hadolint ignore=DL3018
RUN apk add --no-cache git
WORKDIR /app
RUN --mount=type=bind,from=placeholders,source=bbb-playback.placeholder.sh,target=/placeholder.sh \
    sh /placeholder.sh
WORKDIR /app/bbb-playback
RUN npm ci && npm run build && node -p "require('./package.json').version" > build/bbb-playback-version

FROM nginxinc/nginx-unprivileged:1.30-alpine@sha256:f5116ed4606f3eb015dd4a8e28cb9b351476dc0ad4bc6e9f93b19cec130cdf03

COPY --from=build /app/bbb-playback/build /var/bigbluebutton/playback/presentation/2.3
COPY --from=build /app/bbb-playback/playback.nginx /usr/share/bigbluebutton/nginx/
COPY default.conf /etc/nginx/conf.d/default.conf

HEALTHCHECK CMD ["wget", "-q", "--spider", "http://127.0.0.1:8080/playback/presentation/2.3/"]
