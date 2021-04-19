FROM openjdk:11-jre

ENV DEBIAN_FRONTEND noninteractive


#Required to install Libreoffice 7
RUN echo "deb http://deb.debian.org/debian buster-backports main" >> /etc/apt/sources.list
#Required to install MS fonts
RUN echo "deb http://deb.debian.org/debian buster contrib" >> /etc/apt/sources.list

RUN apt update

RUN apt -y install locales-all fontconfig libxt6 libxrender1 
RUN apt install -y -t buster-backports libreoffice
RUN apt -y install  --no-install-recommends fonts-crosextra-carlito fonts-crosextra-caladea fonts-noto fonts-noto-cjk

#MS fonts
RUN echo "ttf-mscorefonts-installer msttcorefonts/accepted-mscorefonts-eula select true" | debconf-set-selections
RUN apt-get install -y --no-install-recommends fontconfig ttf-mscorefonts-installer

RUN dpkg-reconfigure fontconfig && fc-cache -f -s -v

