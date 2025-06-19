# 1. Build stage:
ARG JAVA_BASE_TAG
ARG COMMON_MESSAGE_TAG
FROM ghcr.io/tibroc/bbb-common-message:${COMMON_MESSAGE_TAG} AS build

WORKDIR /bbb-apps-akka

COPY . .

# compile and unzip bin
RUN sbt universal:packageBin \
    && ls -la ./target/universal/ \
    && unzip ./target/universal/bbb-apps-akka-0.0.4.zip -d /

# 2. Runtime stage:
FROM ghcr.io/tibroc/bbb-java-base:${JAVA_BASE_TAG}

COPY --from=build /bbb-apps-akka-0.0.4 /bbb-apps-akka
COPY ./docker/bbb-apps-akka.conf /etc/bigbluebutton/bbb-apps-akka.conf.tmpl
COPY ./docker/entrypoint.sh /entrypoint.sh

USER bigbluebutton
ENTRYPOINT /entrypoint.sh
