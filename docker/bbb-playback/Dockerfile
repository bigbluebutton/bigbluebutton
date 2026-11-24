FROM node:24.22.3-alpine@sha256:116b800c3754b440ee0aa3ed2f20f5bf3d99a554bfd9adeea09ea8017f6e85f5 AS build

# The source at the tag the package builds, cloned by the same script (build/get_external_dependencies.sh)
# hadolint ignore=DL3018
RUN apk add --no-cache git
WORKDIR /app
RUN --mount=type=bind,from=placeholders,source=bbb-playback.placeholder.sh,target=/placeholder.sh \
    sh /placeholder.sh
WORKDIR /app/bbb-playback
RUN npm ci && npm run build && node -p "require('./package.json').version" > build/bbb-playback-version

# Only the files, at the path of the bbb-playback package (build/packages-template/bbb-playback/build.sh).
# The nginx image serves them with the package's location file; compose mounts this image there
# as an image volume.
FROM scratch

COPY --from=build /app/bbb-playback/build /var/bigbluebutton/playback/presentation/2.3
