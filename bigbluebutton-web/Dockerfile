# syntax=docker/dockerfile:1
# 1. Build stage:
FROM bbb-common-web AS build

WORKDIR /bbb-web

COPY . .

# Grails 8 / Spring Boot 4 builds via the Gradle wrapper (see README / packaging)
RUN ./gradlew assemble

WORKDIR /bbb-web/pres-checker

RUN ../gradlew resolveDeps

RUN unzip -q /bbb-web/build/libs/bigbluebutton-0.10.0.war -d /dist

# 2. Runtime stage:
FROM java-base

WORKDIR /usr/share/bbb-web

COPY --from=slides --chown=bigbluebutton / /usr/share/bigbluebutton/blank

COPY --from=build --chown=bigbluebutton /dist /usr/share/bbb-web
COPY --from=build --chown=bigbluebutton /bbb-web/pres-checker/lib /usr/share/prescheck/lib
COPY --from=build --chown=bigbluebutton /bbb-web/pres-checker/run.sh /usr/share/prescheck/prescheck.sh

# Create necessary directories
RUN mkdir -p /var/bigbluebutton/diagnostics /etc/bigbluebutton
RUN chown -R bigbluebutton:bigbluebutton /etc/bigbluebutton /var/bigbluebutton

COPY --chown=bigbluebutton turn-stun-servers.xml.tmpl /etc/bigbluebutton/turn-stun-servers.xml.tmpl

# Hardcode livekit as the bridge services
COPY --chown=bigbluebutton <<EOF /etc/bigbluebutton/bbb-web.properties
audioBridge=livekit
cameraBridge=livekit
screenShareBridge=livekit
redisHost=redis
EOF

COPY docker-entrypoint.sh /entrypoint.sh

COPY --chown=bigbluebutton ./docker/logback.xml /usr/share/bbb-web/WEB-INF/classes/logback.xml

# Move default application.conf file to allow overwrite
RUN mv /usr/share/bbb-web/WEB-INF/classes/application.conf /usr/share/bbb-web/WEB-INF/classes/application-default.conf
# Copy overwrite file
COPY --chown=bigbluebutton ./docker/application.conf /usr/share/bbb-web/WEB-INF/classes/application.conf

COPY --chown=bigbluebutton ./docker/run-in-systemd.sh /usr/share/bbb-web/run-in-systemd.sh
RUN chmod +x /usr/share/bbb-web/run-in-systemd.sh

USER bigbluebutton

ENTRYPOINT ["/entrypoint.sh"]
