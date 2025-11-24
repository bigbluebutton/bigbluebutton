# syntax=docker/dockerfile:1
# 1. Build stage:
FROM bbb-common-message AS build

WORKDIR /bbb-apps-akka

COPY . .

# compile and unzip bin
RUN sbt universal:packageBin \
    && ls -la ./target/universal/ \
    && unzip ./target/universal/bbb-apps-akka-0.0.4.zip -d /

# 2. Runtime stage:
FROM java-base

COPY --from=build /bbb-apps-akka-0.0.4 /bbb-apps-akka
COPY ./docker/bbb-apps-akka.conf /etc/bigbluebutton/bbb-apps-akka.conf.tmpl
COPY ./docker/entrypoint.sh /entrypoint.sh

USER bigbluebutton
ENTRYPOINT /entrypoint.sh
