FROM golang:1.27.4-alpine@sha256:70bd7ddea8b6cbe5d6943cde279d6b67feb10cc924fb9100d1d8757c1575b280 AS build

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

FROM alpine:3.24.4@sha256:f59abe656b692d901e184be3445e084786602108599d2a51d229c0f5a48c71bf

RUN addgroup -S -g 998 bigbluebutton && adduser -S -u 998 -G bigbluebutton bigbluebutton \
 && install -d -m 0700 -o bigbluebutton -g bigbluebutton /var/lib/bbb-webrtc-recorder
COPY --from=build /bbb-webrtc-recorder /usr/bin/bbb-webrtc-recorder
# A file at /etc/bigbluebutton/bbb-webrtc-recorder.yml replaces this one; BBBRECORDER_* env variables override both
COPY --from=build /src/bbb-webrtc-recorder/config/bbb-webrtc-recorder.yml /etc/bbb-webrtc-recorder/bbb-webrtc-recorder.yml

USER 998:998
ENTRYPOINT ["/usr/bin/bbb-webrtc-recorder"]
