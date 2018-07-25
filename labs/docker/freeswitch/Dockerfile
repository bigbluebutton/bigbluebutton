FROM ubuntu:16.04

ENV DEBIAN_FRONTEND noninteractive

RUN apt-get update \
 && apt-get -y install wget libedit-dev xmlstarlet

RUN echo "deb http://ubuntu.bigbluebutton.org/xenial-200-dev bigbluebutton-xenial main " | tee /etc/apt/sources.list.d/bigbluebutton.list \
 && wget http://ubuntu.bigbluebutton.org/repo/bigbluebutton.asc -O- | apt-key add - \
 && apt-get update \
 && apt-get -y install bbb-freeswitch-core

EXPOSE 8021
EXPOSE 5060
EXPOSE 5066
EXPOSE 7443

COPY docker-entrypoint.sh /usr/local/bin/
COPY event_socket_conf.xml /opt/freeswitch/conf/autoload_configs/event_socket.conf.xml

CMD [ "docker-entrypoint.sh" ]
