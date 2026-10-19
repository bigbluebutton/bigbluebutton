# syntax=docker/dockerfile:1
# akka-apps (bbb-apps-akka): upstream's sbt universal package on the shared Java 21 base.
#
# Build with bake (docker/bake/apps-akka.hcl defines the named contexts):
#   docker buildx bake -f docker-bake.hcl $(printf -- '-f %s ' docker/bake/*.hcl) apps-akka
# or with podman (--format docker keeps the HEALTHCHECK), after building the two base targets
# and the html5 client (bigbluebutton-html5/Dockerfile, tagged localhost/bbb-html5-client):
#   podman build -t bbb-common-message bbb-common-message
#   podman build --build-context entrypoint-lib=docker/lib -t bbb-java-base docker/java-base
#   podman build --format docker \
#       --build-context bbb-common-message=container-image://localhost/bbb-common-message \
#       --build-context java-base=container-image://localhost/bbb-java-base \
#       --build-context html5-client=container-image://localhost/bbb-html5-client \
#       -t bbb-apps-akka akka-bbb-apps
#
# Configuration: see docker/entrypoint.sh.

# 1. Build: the files of the Debian package (build/packages-template/bbb-apps-akka/build.sh runs
# `sbt debian:packageBin`, which packages this universal stage). bbb-common-message is
# published in the build stage's local repositories.
# DL3006: bbb-common-message is a named build context, not an image.
# hadolint ignore=DL3006
FROM bbb-common-message AS build

WORKDIR /bbb-apps-akka
# Dependencies first, so that a source change does not download them again.
COPY build.sbt ./
COPY project project
RUN sbt update
COPY src src
RUN sbt Universal/stage

# Container wiring, applied to the shipped configuration as bbb-config's after-install edits
# application.conf on bare metal: application.conf.patch (container host names, listen address,
# values from the environment), and logback without the file appender (logs go to stdout).
# Modes: the start script is 0744 in the stage, but any UID must run it (docker/README.md).
# The Windows start script is dropped.
COPY docker/application.conf.patch /tmp/
WORKDIR /bbb-apps-akka/target/universal/stage/conf
RUN git apply --verbose /tmp/application.conf.patch \
    && sed -i '/<appender name="FILE"/,/<\/appender>/d; /<appender-ref ref="FILE"/d' logback.xml \
    && if grep -q 'FILE' logback.xml; then echo "logback.xml: file appender not removed" >&2; exit 1; fi \
    && rm ../bin/bbb-apps-akka.bat \
    && chmod 0644 ./* \
    && chmod 0755 ../bin/bbb-apps-akka

# The redis address as akka-apps reads it, for the entrypoint's redis wait: the same Typesafe
# Config call and defaults as SystemConfiguration.scala (ConfigFactory.load(), redis.host
# 127.0.0.1, redis.port 6379), so includes, substitutions and every HOCON form of a Tier 3 file
# give the address akka-apps will connect to. Prints "HOST PORT".
COPY <<'EOF' /tmp/redis-address/RedisAddress.java
import com.typesafe.config.Config;
import com.typesafe.config.ConfigFactory;

public final class RedisAddress {
    public static void main(String[] args) {
        Config config = ConfigFactory.load();
        String host;
        try {
            host = config.getString("redis.host");
        } catch (RuntimeException e) {
            host = "127.0.0.1";
        }
        int port;
        try {
            port = config.getInt("redis.port");
        } catch (RuntimeException e) {
            port = 6379;
        }
        System.out.println(host + " " + port);
    }
}
EOF

WORKDIR /tmp/redis-address
RUN javac --release 21 -cp "$(find /bbb-apps-akka/target/universal/stage/lib -name 'com.typesafe.config-*.jar')" \
        -d /redis-address RedisAddress.java \
    && chmod -R a+rX,go-w /redis-address

# 2. Runtime
# DL3006: java-base is a named build context, not an image.
# hadolint ignore=DL3006
FROM java-base

# The package's directory (/usr/share/bbb-apps-akka: bin, lib, conf), root-owned and read-only.
COPY --from=build /bbb-apps-akka/target/universal/stage /usr/share/bbb-apps-akka
COPY --from=build /redis-address /usr/local/lib/bbb/akka-apps
# akka-apps reads the HTML5 client settings and hands them to clients (ClientSettings.scala):
# the html5 client build's settings.yml, as on bare metal (the bbb-html5 package's file), so it
# has the same build identifier and release as the client nginx serves. The override /etc/bigbluebutton/bbb-html5.yml is merged over them if mounted (Tier 3).
# Its directory is created first, traversable by any UID (docker/README.md). The override ships
# empty ({}), as bare metal always has the file (without it akka-apps logs an error at every
# start); an admin's file is bind-mounted over it.
RUN install -d -m 0755 /usr/share/bigbluebutton/html5-client/private/config /etc/bigbluebutton \
    && printf '{}\n' > /etc/bigbluebutton/bbb-html5.yml \
    && chmod 0644 /etc/bigbluebutton/bbb-html5.yml
# DL3022: html5-client is a named build context, not a stage.
# hadolint ignore=DL3022
COPY --from=html5-client --chmod=0644 /usr/share/bigbluebutton/html5-client/private/config/settings.yml \
     /usr/share/bigbluebutton/html5-client/private/config/settings.yml
COPY --chmod=0755 docker/entrypoint.sh /entrypoint.sh

# As in the systemd unit (src/templates/systemloader/systemd/start-template).
ENV MALLOC_ARENA_MAX=2
WORKDIR /usr/share/bbb-apps-akka

USER 998:998
# HTTP API (healthz; userInfo for the Hasura auth hook; graphql-middleware session variables).
EXPOSE 8901
# Healthy when the HTTP API answers /healthz. Its 503 is accepted: /healthz turns 200 only once
# bbb-web's keep-alive pings arrive through redis (ApiService.scala, BigBlueButtonActor.scala
# handleCheckAlivePingSysMsg), which would make akka-apps' health depend on bbb-web.
# bash's /dev/tcp: the base has no HTTP client.
HEALTHCHECK --interval=10s --timeout=5s --start-period=60s --retries=3 \
    CMD ["bash", "-c", "exec 3<>/dev/tcp/127.0.0.1/8901 && printf 'GET /healthz HTTP/1.0\\r\\nHost: 127.0.0.1\\r\\n\\r\\n' >&3 && head -n 1 <&3 | grep -qE '^HTTP/1\\.[01] (200|503) '"]
ENTRYPOINT ["/entrypoint.sh"]
