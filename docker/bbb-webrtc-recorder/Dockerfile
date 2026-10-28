FROM golang:1.27-alpine@sha256:f2c872bcee949b7be9c490efd02b48a8a2fbf947cdf533f1c58525ec9d8170fd AS build

# The source at the tag the package builds, cloned by the same script (build/get_external_dependencies.sh)
# hadolint ignore=DL3018
RUN apk add --no-cache git
WORKDIR /src
RUN --mount=type=bind,from=placeholders,source=bbb-webrtc-recorder.placeholder.sh,target=/placeholder.sh \
    sh /placeholder.sh
WORKDIR /src/bbb-webrtc-recorder
# VERSION holds "<version> <release>"
RUN CGO_ENABLED=0 go build -o /bbb-webrtc-recorder \
    -ldflags="-X 'github.com/bigbluebutton/bbb-webrtc-recorder/internal.AppVersion=v$(tr ' ' - < VERSION)'" \
    ./cmd/bbb-webrtc-recorder

FROM alpine:3.24@sha256:294b683cb724975bec92580e1e685676bd4b50bda910ddb8c51d4cabeaec77e6

RUN addgroup -S -g 998 bigbluebutton && adduser -S -u 998 -G bigbluebutton bigbluebutton \
 && install -d -m 0700 -o bigbluebutton -g bigbluebutton /var/lib/bbb-webrtc-recorder
COPY --from=build /bbb-webrtc-recorder /usr/bin/bbb-webrtc-recorder
# A file at /etc/bigbluebutton/bbb-webrtc-recorder.yml replaces this one; BBBRECORDER_* env variables override both
COPY --from=build /src/bbb-webrtc-recorder/config/bbb-webrtc-recorder.yml /etc/bbb-webrtc-recorder/bbb-webrtc-recorder.yml

USER 998:998
ENTRYPOINT ["/usr/bin/bbb-webrtc-recorder"]
