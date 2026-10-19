# Build stage shared by the JVM images: bbb-common-message compiled and published to the local
# Maven and Ivy repositories (/root/.m2/repository, /root/.ivy2/local) by its own deploy.sh,
# with sbt and a JDK 21 left in place for the builds that depend on it (akka-apps,
# bbb-common-web). Never shipped: images use it only as a build stage, via the bake named
# context `bbb-common-message` (docker/bake/bbb-common-message.hcl).
#
#   podman build -t bbb-common-message bbb-common-message
#
# JDK 21 because the sources are compiled with `-release:21` (build.sbt). The sbt launcher
# fetches the sbt version that project/build.properties names.

# sbtscala/scala-sbt:eclipse-temurin-21.0.6_7_1.10.7_2.13.16
FROM docker.io/sbtscala/scala-sbt@sha256:3b5053fabe55ff92a0702dea5e8a4d26d92e4e660ce43ce4996fafd28fddc31c

WORKDIR /bbb-common-message

# Dependencies first, so that a source change does not download them again.
COPY build.sbt ./
COPY project/build.properties project/Dependencies.scala project/plugins.sbt project/
RUN sbt update

COPY . .
RUN ./deploy.sh
