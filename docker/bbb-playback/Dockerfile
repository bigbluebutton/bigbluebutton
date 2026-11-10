FROM node:24-alpine@sha256:8a32c8cf649a49915a66e81e7a609223c708d0adabf288ee3f4077d765542f85 AS build

# The source at the tag the package builds, cloned by the same script (build/get_external_dependencies.sh)
# hadolint ignore=DL3018
RUN apk add --no-cache git
WORKDIR /app
RUN --mount=type=bind,from=placeholders,source=bbb-playback.placeholder.sh,target=/placeholder.sh \
    sh /placeholder.sh
WORKDIR /app/bbb-playback
RUN npm ci && npm run build && node -p "require('./package.json').version" > build/bbb-playback-version

FROM nginxinc/nginx-unprivileged:1.31-alpine@sha256:b5047b9b76845eac124358373c6852377c52e4b05834a47647e955dd91cb8f1e

COPY --from=build /app/bbb-playback/build /var/bigbluebutton/playback/presentation/2.3
COPY --from=build /app/bbb-playback/playback.nginx /usr/share/bigbluebutton/nginx/
COPY default.conf /etc/nginx/conf.d/default.conf

HEALTHCHECK CMD ["wget", "-q", "--spider", "http://127.0.0.1:8080/playback/presentation/2.3/"]
