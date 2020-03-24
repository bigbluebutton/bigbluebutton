FROM bbb-common-message AS builder

ARG COMMON_VERSION=0.0.1-SNAPSHOT

COPY . /source

RUN cd /source \
 && find -name Dependencies.scala -exec sed -i "s|\(.*org.bigbluebutton.*bbb-common-message[^\"]*\"[ ]*%[ ]*\)Versions\.bbbCommons\(.*\)|\1\"$COMMON_VERSION\"\2|g" {} \; \
 && sbt compile

RUN apt-get update \
 && apt-get -y install fakeroot

RUN cd /source \
 && sbt debian:packageBin

FROM ubuntu:16.04
RUN apt-get update \
 && apt-get install -y openjdk-8-jre-headless

COPY --from=builder /source/target/*.deb /root/

RUN dpkg -i /root/*.deb

WORKDIR /usr/share/bbb-apps-akka
CMD ["/usr/share/bbb-apps-akka/bin/bbb-apps-akka"]
