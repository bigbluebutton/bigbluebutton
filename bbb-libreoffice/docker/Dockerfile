FROM openjdk:11-jre-bullseye
ENV DEBIAN_FRONTEND noninteractive

RUN echo "deb http://deb.debian.org/debian bullseye-backports main" >> /etc/apt/sources.list
RUN apt update && apt -y install locales-all fontconfig libxt6 libxrender1
RUN apt update && apt -y install -t \
  bullseye-backports \
  libreoffice \
  && rm -f \
  /usr/share/java/ant-apache-log4j-1.10.9.jar \
  /usr/share/java/log4j-1.2-1.2.17.jar /usr/share/java/log4j-1.2.jar \
  /usr/share/maven-repo/log4j/log4j/1.2.17/log4j-1.2.17.jar \
  /usr/share/maven-repo/log4j/log4j/1.2.x/log4j-1.2.x.jar \
  /usr/share/maven-repo/org/apache/ant/ant-apache-log4j/1.10.9/ant-apache-log4j-1.10.9.jar

