FROM bbb-common-message AS build

WORKDIR /bbb-apps-akka

COPY . .

RUN sbt stage

FROM java-base

WORKDIR /usr/share/bbb-apps-akka

COPY --from=build --chmod=755 /bbb-apps-akka/target/universal/stage .
COPY --from=html5-config settings.yml /usr/share/bigbluebutton/html5-client/private/config/settings.yml
# The client build id, as the html5 image stamps it
ARG CLIENT_BUILD=0
RUN sed -i "s/HTML5_CLIENT_VERSION/${CLIENT_BUILD}/" /usr/share/bigbluebutton/html5-client/private/config/settings.yml

# The start script reads /etc/bigbluebutton/bbb-apps-akka.conf, which must exist; the image's only includes the defaults
RUN mkdir -p /etc/bigbluebutton \
    && echo 'include "/usr/share/bbb-apps-akka/conf/application.conf"' > /etc/bigbluebutton/bbb-apps-akka.conf

# Listen on all interfaces instead of 127.0.0.1 (http.interface in conf/application.conf); log to stdout only
ENV INTERFACE=0.0.0.0 \
    BBB_LOG_FILE_APPENDER=STDOUT

USER 998:998

EXPOSE 8901

HEALTHCHECK CMD ["curl", "-fsS", "-o", "/dev/null", "http://127.0.0.1:8901/healthz"]

ENTRYPOINT ["bin/bbb-apps-akka"]
