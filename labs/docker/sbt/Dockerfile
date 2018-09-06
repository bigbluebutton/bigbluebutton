FROM openjdk:8

ARG SBT_VERSION=0.13.8

RUN curl -L -o sbt-$SBT_VERSION.deb https://dl.bintray.com/sbt/debian/sbt-$SBT_VERSION.deb \
 && dpkg -i sbt-$SBT_VERSION.deb \
 && rm sbt-$SBT_VERSION.deb \
 && apt-get update \
 && apt-get install sbt \
 && sbt sbtVersion

RUN echo 'resolvers += "Artima Maven Repository" at "http://repo.artima.com/releases"' | tee -a ~/.sbt/0.13/global.sbt

WORKDIR /root
