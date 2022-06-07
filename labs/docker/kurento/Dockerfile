FROM ubuntu:16.04

# In order to build kurento dev, use:
# docker build --build-arg APT_KEY="http://keyserver.ubuntu.com/pks/lookup?op=get&options=mr&search=0xFC8A16625AFA7A83" --build-arg APT_REPO="deb [arch=amd64] http://ubuntu.openvidu.io/dev xenial kms6" --build-arg CACHE_BUST="$(date +%s)" -t mconf/kurento:upstream-dev .

ARG APT_KEY="https://ubuntu.bigbluebutton.org/repo/bigbluebutton.asc"
ARG APT_REPO="deb https://ubuntu.bigbluebutton.org/xenial-220-dev bigbluebutton-xenial main"
ARG CACHE_BUST=1

ENV DEBIAN_FRONTEND noninteractive

RUN apt-get update \
 && apt-get -y dist-upgrade \
 && apt-get install -y software-properties-common curl wget apt-transport-https

RUN wget "$APT_KEY" -O- | apt-key add - \
 && add-apt-repository "$APT_REPO" \
 && apt-get update \
 && apt-get -y install kurento-media-server bzip2 jq \
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

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["/usr/bin/kurento-media-server"]
