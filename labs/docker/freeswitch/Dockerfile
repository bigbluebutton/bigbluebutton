FROM ubuntu:16.04

ENV DEBIAN_FRONTEND noninteractive

RUN apt-get update \
 && apt-get -y install wget libedit-dev xmlstarlet apt-transport-https ca-certificates software-properties-common

RUN echo "deb https://ubuntu.bigbluebutton.org/xenial-220/ bigbluebutton-xenial main " | tee /etc/apt/sources.list.d/bigbluebutton.list \
 && wget http://ubuntu.bigbluebutton.org/repo/bigbluebutton.asc -O- | apt-key add - \
 && add-apt-repository ppa:bigbluebutton/support \
 && apt-get update \
 && apt-get -y install bbb-freeswitch-core \
 && find /opt/freeswitch/conf/sip_profiles/ -name "*ipv6*" -prune -exec rm -rf "{}" \; \
 && rm -rf /var/lib/apt/lists/*

EXPOSE 7443 5066

COPY docker-entrypoint.sh /usr/local/bin/
COPY event_socket_conf.xml /opt/freeswitch/conf/autoload_configs/event_socket.conf.xml
# COPY external.xml /opt/freeswitch/conf/sip_profiles/external.xml
# COPY vars.xml /opt/freeswitch/conf/vars.xml

RUN wget -O /usr/local/bin/dumb-init https://github.com/Yelp/dumb-init/releases/download/v1.2.2/dumb-init_1.2.2_amd64 \
 && chmod +x /usr/local/bin/dumb-init

ENTRYPOINT ["/usr/local/bin/dumb-init", "--"]

CMD [ "docker-entrypoint.sh" ]
