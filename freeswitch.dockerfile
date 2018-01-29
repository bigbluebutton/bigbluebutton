FROM ubuntu:16.04

ENV DEBIAN_FRONTEND noninteractive

RUN apt-get update \
 && apt-get -y install wget libedit-dev

RUN echo "deb http://ubuntu.bigbluebutton.org/xenial-200 bigbluebutton-xenial main " | tee /etc/apt/sources.list.d/bigbluebutton.list \
 && wget http://ubuntu.bigbluebutton.org/repo/bigbluebutton.asc -O- | apt-key add - \
 && apt-get update \
 && apt-get -y install bbb-freeswitch-core

RUN apt-get -y install xmlstarlet \
 && xmlstarlet edit --inplace --update "//param[@name='listen-ip']/@value" --value "0.0.0.0" /opt/freeswitch/etc/freeswitch/autoload_configs/event_socket.conf.xml

EXPOSE 8021
EXPOSE 5060
EXPOSE 5066
EXPOSE 7443

CMD [ "/opt/freeswitch/bin/freeswitch" ]
