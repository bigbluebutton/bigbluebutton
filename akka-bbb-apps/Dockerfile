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

RUN curl -L -o /usr/local/bin/yq https://github.com/mikefarah/yq/releases/latest/download/yq_linux_amd64 && chmod a+x /usr/local/bin/yq

COPY --from=build --chown=bigbluebutton /bbb-apps-akka-0.0.4 /bbb-apps-akka
COPY --chown=bigbluebutton ./docker/bbb-apps-akka-docker.conf /bbb-apps-akka/conf/docker.conf
COPY --chown=bigbluebutton ./docker/bbb-apps-akka-overwrite.conf /etc/bigbluebutton/bbb-apps-akka.conf.tmpl
COPY --chown=bigbluebutton ./docker/entrypoint.sh /entrypoint.sh

COPY --chown=bigbluebutton ./docker/logback.xml /bbb-apps-akka/conf/logback.xml

# Create log directory owned by bigbluebutton user
RUN mkdir -p logs \
 && chown -R bigbluebutton:bigbluebutton logs

# Copy html5 default config
RUN mkdir -p /usr/share/bigbluebutton/html5-client/private/config/
COPY --chown=bigbluebutton:bigbluebutton --from=html5-config / /usr/share/bigbluebutton/html5-client/private/config/
RUN chown -R bigbluebutton:bigbluebutton /usr/share/bigbluebutton/html5-client/private/config/

USER bigbluebutton

ENTRYPOINT ["/entrypoint.sh"]
