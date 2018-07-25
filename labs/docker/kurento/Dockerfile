FROM ubuntu:16.04

RUN apt-get update \
 && apt-get -y dist-upgrade \
 && apt-get install -y software-properties-common curl wget apt-transport-https

RUN wget https://ubuntu.bigbluebutton.org/repo/bigbluebutton.asc -O- | apt-key add - \
 && add-apt-repository "deb https://ubuntu.bigbluebutton.org/xenial-200-dev bigbluebutton-xenial main" \
 && apt-get update \
 && apt-get -y install kurento-media-server \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*

RUN apt-get update \
 && apt-get install -y bzip2 \
 && apt-get install -y --download-only openh264-gst-plugins-bad-1.5

EXPOSE 8888

COPY ./docker-entrypoint.sh /usr/local/bin/
COPY ./healthchecker.sh /healthchecker.sh

HEALTHCHECK --start-period=15s --interval=30s --timeout=3s --retries=1 CMD /healthchecker.sh

ENV GST_DEBUG=Kurento*:5

ENTRYPOINT ["docker-entrypoint.sh"]
