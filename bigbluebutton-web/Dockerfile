# syntax=docker/dockerfile:1
# bbb-web. Build with bake (docker/README.md, "Building"); the named contexts are defined in
# docker/bake/web.hcl.
#
# 1. Build stage: the bbb-common-web build image (JDK 21, sbt, bbb-common-message and
#    bbb-common-web published to ~/.m2), plus Gradle at the wrapper's version
#    (gradle/wrapper/gradle-wrapper.properties), checked against its published SHA-256.
#    Same steps as build/packages-template/bbb-web/build.sh.
# hadolint ignore=DL3006
FROM bbb-common-web AS build

ARG GRADLE_VERSION=9.8.0
ARG GRADLE_SHA256=bafd5ce9cfaea0fbccfdc8439a1ac42fbd4cd9c89dc9a988228d8a2639a58e6c

SHELL ["/bin/bash", "-o", "pipefail", "-c"]

RUN curl -fsSL -o /tmp/gradle.zip "https://services.gradle.org/distributions/gradle-${GRADLE_VERSION}-bin.zip" \
    && echo "${GRADLE_SHA256}  /tmp/gradle.zip" | sha256sum -c - \
    && unzip -q /tmp/gradle.zip -d /opt \
    && rm /tmp/gradle.zip

ENV PATH=/opt/gradle-${GRADLE_VERSION}/bin:$PATH

WORKDIR /bbb-web

# The image files are not build input: editing them must not rebuild the WAR.
COPY --exclude=docker --exclude=Dockerfile . .

RUN gradle --no-daemon clean \
    && gradle --no-daemon resolveDeps \
    && gradle --no-daemon assemble \
    && mkdir -p /staging/usr/share/bbb-web \
    && unzip -q /bbb-web/build/libs/bigbluebutton-0.10.0.war -d /staging/usr/share/bbb-web

WORKDIR /bbb-web/pres-checker

RUN gradle --no-daemon clean \
    && gradle --no-daemon resolveDeps \
    && gradle --no-daemon jar \
    && mkdir -p /staging/usr/share/prescheck/lib \
    && cp lib/* /staging/usr/share/prescheck/lib \
    && cp build/libs/bbb-pres-check-*.jar /staging/usr/share/prescheck/lib \
    && install -m 0755 run.sh /staging/usr/share/prescheck/prescheck.sh

# JNA's native library (nuprocess, which runs the conversion tools, calls libc through JNA).
# By default JNA unpacks it from its jar into a temporary directory (/tmp here) and loads it
# from there, which fails where /tmp is mounted noexec (Docker's tmpfs default). The image
# ships the library of the target architecture from the same jar instead, and the entrypoint
# points JNA at it (jna.boot.library.path, jna.nounpack; docker/entrypoint.sh).
ARG TARGETARCH
RUN case "${TARGETARCH}" in \
        amd64) jna_arch=linux-x86-64 ;; \
        arm64) jna_arch=linux-aarch64 ;; \
        *) echo "no JNA native library mapping for TARGETARCH=${TARGETARCH}" >&2; exit 1 ;; \
    esac \
    && set -- /staging/usr/share/bbb-web/WEB-INF/lib/jna-[0-9]*.jar \
    && [ "$#" -eq 1 ] && [ -f "$1" ] \
    && install -d -m 0755 /staging/usr/local/lib/bbb/bbb-web/jna \
    && unzip -j -q "$1" "com/sun/jna/${jna_arch}/libjnidispatch.so" -d /staging/usr/local/lib/bbb/bbb-web/jna \
    && chmod 0644 /staging/usr/local/lib/bbb/bbb-web/jna/libjnidispatch.so

# 2. Runtime stage: the shared Java base (Ubuntu 24.04, OpenJDK 21 JRE, entrypoint helper)
#    with the tools bbb-web runs for presentation conversion (bbb-common-web: convert and
#    identify, gs, pdfinfo, pdffonts, pdftocairo, pdftoppm, pdftotext) and the fonts of the
#    bbb-web package (build/packages-template/bbb-web/opts-noble.sh).
# hadolint ignore=DL3006
FROM java-base

SHELL ["/bin/bash", "-o", "pipefail", "-c"]

# envsubst: entrypoint helper. curl: healthcheck and convert-remote.sh.
# hadolint ignore=DL3008
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        curl gettext-base ghostscript imagemagick libmagickcore-6.q16-7-extra poppler-utils \
        fonts-crosextra-caladea fonts-crosextra-carlito fonts-noto \
    && rm -rf /var/lib/apt/lists/*

# ImageMagick policy as bbb-install writes it (web-safe policy with the paths bbb-web uses).
COPY --chmod=0644 docker/policy.xml /etc/ImageMagick-6/policy.xml

# Package files: /etc/default/bbb-web (the unit's EnvironmentFile, from bbb-web.env), the
# blank slides and nopdfmark.ps (bbb-config), the html5 settings catalog that bbb-web reads
# to validate client settings overrides (clientSettingsFilePath; the html5 client build's file,
# as nginx and akka-apps have it). Their directories are created
# first, traversable by any UID (docker/README.md).
# DL3022: named build contexts (docker/bake/web.hcl), not stages.
RUN install -d -m 0755 /etc/bigbluebutton /usr/share/bigbluebutton/blank \
        /usr/share/bigbluebutton/html5-client/private/config
# hadolint ignore=DL3022
COPY --from=bbb-web-package --chmod=0644 bbb-web.env /etc/default/bbb-web
# hadolint ignore=DL3022
COPY --from=slides --chmod=0644 blank-presentation.pdf blank-thumb.png blank-png.png blank-svg.svg /usr/share/bigbluebutton/blank/
# hadolint ignore=DL3022
COPY --from=slides --chmod=0644 nopdfmark.ps /etc/bigbluebutton/nopdfmark.ps
# hadolint ignore=DL3022
COPY --from=html5-client --chmod=0644 /usr/share/bigbluebutton/html5-client/private/config/settings.yml \
     /usr/share/bigbluebutton/html5-client/private/config/settings.yml

COPY --from=build /staging/ /

# The classpath bigbluebutton.properties and spring/turn-stun-servers.xml are rendered at
# start (docker/entrypoint.sh): upstream's properties file moves out of the classpath as the
# entrypoint's base, and both classpath paths become links into /run/bbb-web, writable for
# any UID. Logging goes to stdout only: the FILE appender (logs/bbb-web.log) is removed from
# upstream's logback.xml. /var/bigbluebutton is the data volume; diagnostics is the heap dump
# path of /etc/default/bbb-web.
ARG CLASSES=/usr/share/bbb-web/WEB-INF/classes
RUN install -d -m 0755 /usr/local/share/bbb/bbb-web \
    && mv "$CLASSES/bigbluebutton.properties" /usr/local/share/bbb/bbb-web/bigbluebutton.properties \
    && rm "$CLASSES/spring/turn-stun-servers.xml" \
    && install -d -m 1777 /run/bbb-web \
    && ln -s /run/bbb-web/bigbluebutton.properties "$CLASSES/bigbluebutton.properties" \
    && ln -s /run/bbb-web/spring/turn-stun-servers.xml "$CLASSES/spring/turn-stun-servers.xml" \
    && sed -i -e '/<appender name="FILE"/,/<\/appender>/d' -e '/<appender-ref ref="FILE"/d' "$CLASSES/logback.xml" \
    && ! grep -q FILE "$CLASSES/logback.xml" \
    && install -d -m 1777 /var/bigbluebutton /var/bigbluebutton/diagnostics

COPY --chmod=0644 docker/turn-stun-servers.xml /usr/local/share/bbb/bbb-web/turn-stun-servers.xml
COPY --chmod=0755 docker/convert-remote.sh /usr/local/share/bbb/bbb-web/convert-remote.sh
COPY --chmod=0755 docker/run-in-systemd.sh /usr/share/bbb-web/run-in-systemd.sh
COPY --chmod=0755 docker/entrypoint.sh /entrypoint.sh

# Default BBB_UID/BBB_GID (docker/config-contract.yaml); compose sets the deployment's ids.
USER 998:998

WORKDIR /usr/share/bbb-web

EXPOSE 8090

HEALTHCHECK --interval=10s --timeout=5s --start-period=120s --retries=3 \
    CMD ["curl", "-fsS", "-o", "/dev/null", "http://127.0.0.1:8090/bigbluebutton/api"]

ENTRYPOINT ["/entrypoint.sh"]
CMD []
