# syntax=docker/dockerfile:1
# Build image for bbb-common-web, used as the build stage of bigbluebutton-web (bake target
# bbb-common-web, never pushed). Builds and publishes the library as upstream packaging does
# (build/packages-template/bbb-web/build.sh: `sbt update publish publishLocal` via deploy.sh).
#
# JDK: Ubuntu's OpenJDK 21, the JDK bare metal installs (build/packages-template/bbb-web/opts-noble.sh);
# build.sbt compiles with -release:21. sbt: the launcher of the version in project/build.properties,
# checked against its published SHA-256.
#
# bbb-common-message comes from the named context `bbb-common-message` (its bake target), which
# publishes it to ~/.m2 (read by Gradle in bigbluebutton-web) and ~/.ivy2/local (read by sbt).

# ubuntu:24.04
FROM docker.io/library/ubuntu@sha256:534baea6a22c03a63003dbc8dbe78fe34bc0d7e595d9a9dc9834884ff530eb55

ARG SBT_VERSION=1.10.7
ARG SBT_SHA256=32c15233c636c233ee25a2c31879049db7021cfef70807c187515c39b96b0fe6

SHELL ["/bin/bash", "-o", "pipefail", "-c"]

# hadolint ignore=DL3008
RUN apt-get update \
    && apt-get install -y --no-install-recommends openjdk-21-jdk-headless ca-certificates curl unzip \
    && rm -rf /var/lib/apt/lists/* \
    && curl -fsSL -o /tmp/sbt.tgz "https://github.com/sbt/sbt/releases/download/v${SBT_VERSION}/sbt-${SBT_VERSION}.tgz" \
    && echo "${SBT_SHA256}  /tmp/sbt.tgz" | sha256sum -c - \
    && tar -xzf /tmp/sbt.tgz -C /opt \
    && rm /tmp/sbt.tgz

ENV PATH=/opt/sbt/bin:$PATH

# DL3022: bbb-common-message is a named build context (bake target), not a stage.
# hadolint ignore=DL3022
COPY --from=bbb-common-message /root/.m2/repository/org/bigbluebutton/ /root/.m2/repository/org/bigbluebutton/
# hadolint ignore=DL3022
COPY --from=bbb-common-message /root/.ivy2/local/org.bigbluebutton/ /root/.ivy2/local/org.bigbluebutton/

WORKDIR /bbb-common-web

COPY . .

RUN ./deploy.sh
