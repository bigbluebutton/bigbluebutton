FROM openjdk:11-jre-buster

ENV DEBIAN_FRONTEND noninteractive


#Required to install Libreoffice 7
RUN echo "deb http://deb.debian.org/debian buster-backports main" >> /etc/apt/sources.list

RUN apt-get update \
 && apt-get -y install locales-all fontconfig libxt6 libxrender1 \
 && rm -rf /var/lib/apt/lists/* \
 && rm -rf /usr/share/doc && rm -rf /usr/share/man \
 && apt-get clean
RUN apt-get update && apt-get -y install -t buster-backports libreoffice \
 && rm -rf /var/lib/apt/lists/* \
 && rm -rf /usr/share/doc && rm -rf /usr/share/man \
 && apt-get clean
