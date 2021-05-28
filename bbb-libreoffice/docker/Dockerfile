FROM openjdk:11-jre

ENV DEBIAN_FRONTEND noninteractive


#Required to install Libreoffice 7
RUN echo "deb http://deb.debian.org/debian buster-backports main" >> /etc/apt/sources.list

RUN apt update

RUN apt -y install locales-all fontconfig libxt6 libxrender1 
RUN apt install -y -t buster-backports libreoffice

