FROM kurento/kurento-media-server:6.13

ARG APT_KEY="https://ubuntu.bigbluebutton.org/repo/bigbluebutton.asc"
ARG APT_REPO="deb https://ubuntu.bigbluebutton.org/xenial-220-dev bigbluebutton-xenial main"
ARG CACHE_BUST=1

ENV DEBIAN_FRONTEND noninteractive

RUN apt-get update \
 && apt-get -y dist-upgrade \
 && apt-get install -y software-properties-common curl wget apt-transport-https \
 && rm -rf /var/lib/apt/lists/*

RUN wget "$APT_KEY" -O- | apt-key add - \
 && add-apt-repository "$APT_REPO" \
 && apt-get update \
 && apt-get -y install bzip2 jq \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*

RUN apt-get update \
 && apt-get install -y --download-only openh264-gst-plugins-bad-1.5

COPY ./docker-entrypoint.sh /usr/local/bin/
COPY ./healthchecker.sh /healthchecker.sh

ENV GST_DEBUG=Kurento*:5
ENV PORT=8888
# stun.l.google.com
ENV STUN_IP=64.233.186.127
ENV STUN_PORT=19302
ENV TURN_URL=""
ENV RTP_MIN_PORT=24577
ENV RTP_MAX_PORT=32768

HEALTHCHECK --start-period=15s --interval=30s --timeout=3s --retries=1 CMD /healthchecker.sh

EXPOSE 8888

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["/usr/bin/kurento-media-server"]
