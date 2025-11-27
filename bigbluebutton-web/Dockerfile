# syntax=docker/dockerfile:1
# 1. Build stage:
FROM bbb-common-web AS build

# look to bigbluebutton-web/gradle.properties for version info
ENV GRADLE_VERSION=7.6.3
ENV GRAILS_VERSION=6.1.0

ENV APACHE_GRAILS=grails-${GRAILS_VERSION}
ENV GRADLE_HOME=/tools/gradle-${GRADLE_VERSION}
ENV GRAILS_HOME=/tools/grails/grails-${GRAILS_VERSION}

WORKDIR /tools

RUN wget --no-verbose https://github.com/apache/grails-core/releases/download/v${GRAILS_VERSION}/${APACHE_GRAILS}.zip \
  && unzip -q ${APACHE_GRAILS}.zip \
  && ln -s ${PWD}/${APACHE_GRAILS}/bin/grails /usr/bin/grails \
  && rm -f ${APACHE_GRAILS}.zip \
  && wget --no-verbose https://services.gradle.org/distributions/gradle-${GRADLE_VERSION}-all.zip \
  && unzip -q gradle-${GRADLE_VERSION}-all.zip \
  && ln -s ${PWD}/gradle-${GRADLE_VERSION}/bin/gradle /usr/bin/gradle \
  && rm -f gradle-${GRADLE_VERSION}-all.zip

WORKDIR /bbb-web

COPY . .

RUN grails assemble

WORKDIR /bbb-web/pres-checker

RUN gradle resolveDeps

RUN unzip -q /bbb-web/build/libs/bigbluebutton-0.10.0.war -d /dist

# 2. Runtime stage:
FROM java-base

COPY --from=slides / /usr/share/bigbluebutton/blank

COPY --from=build /dist /usr/share/bbb-web
COPY --from=build /bbb-web/pres-checker/lib /usr/share/prescheck/lib
COPY --from=build /bbb-web/pres-checker/run.sh /usr/share/prescheck/prescheck.sh

# Create necessary directories
RUN mkdir -p /var/bigbluebutton/diagnostics /etc/bigbluebutton

COPY turn-stun-servers.xml.tmpl /etc/bigbluebutton/turn-stun-servers.xml.tmpl

# Hardcode livekit as the bridge services
COPY <<EOF /etc/bigbluebutton/bbb-web.properties
audioBridge=livekit
cameraBridge=livekit
screenShareBridge=livekit
EOF

COPY docker-entrypoint.sh /entrypoint.sh
RUN chown -R bigbluebutton:bigbluebutton /etc/bigbluebutton

USER bigbluebutton

ENTRYPOINT ["/entrypoint.sh"]
