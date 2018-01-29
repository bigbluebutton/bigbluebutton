FROM debian:stretch

ENV DEBIAN_FRONTEND noninteractive

RUN apt-get update \
 && apt-get -y install libreoffice fonts-* hyphen-*

EXPOSE 8100

COPY ./libreoffice-run.sh /libreoffice-run.sh

CMD [ "/libreoffice-run.sh" ]

