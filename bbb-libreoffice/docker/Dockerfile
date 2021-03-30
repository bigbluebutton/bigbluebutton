FROM openjdk:11-jre

ENV DEBIAN_FRONTEND noninteractive

RUN apt update

RUN apt -y install locales-all fontconfig libxt6 libxrender1 
RUN apt -y install  --no-install-recommends libreoffice fonts-crosextra-carlito fonts-crosextra-caladea fonts-noto fonts-noto-cjk


RUN dpkg-reconfigure fontconfig && fc-cache -f -s -v


