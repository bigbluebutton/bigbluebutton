FROM debian:stretch

ENV DEBIAN_FRONTEND noninteractive

RUN apt-get update \
 && apt-get -y install libreoffice fonts-* hyphen-*

ENV PORT 8100

COPY ./docker-entrypoint.sh /docker-entrypoint.sh

CMD [ "./docker-entrypoint.sh" ]
