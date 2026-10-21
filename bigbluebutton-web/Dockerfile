# Build steps as in build/packages-template/bbb-web/build.sh
FROM bbb-common-web AS build

WORKDIR /bbb-web

COPY . .

RUN ./gradlew assemble

WORKDIR /bbb-web/pres-checker

RUN ../gradlew resolveDeps jar \
    && cp build/libs/bbb-pres-check-*.jar lib/

WORKDIR /dist

RUN jar -xf /bbb-web/build/libs/bigbluebutton-0.10.0.war

FROM java-base

# Runtime dependencies from build/packages-template/bbb-web/opts-noble.sh that bbb-web calls
# (xpdf-utils is poppler-utils on noble; ghostscript and the magick coders are imagemagick's recommends).
# Versions come from the pinned base image's Ubuntu release.
# fonts-noto-cjk: bare metal gets it as a recommend of fonts-noto, needed for CJK slides.
# hadolint ignore=DL3008
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        imagemagick libmagickcore-6.q16-7-extra ghostscript poppler-utils potrace file \
        fonts-crosextra-carlito fonts-crosextra-caladea fonts-noto fonts-noto-cjk \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/share/bbb-web

COPY --from=build /dist .
COPY --from=build /bbb-web/pres-checker/lib /usr/share/prescheck/lib
COPY --from=build /bbb-web/pres-checker/run.sh /usr/share/prescheck/prescheck.sh
COPY ./docker/run-in-systemd.sh /usr/share/bbb-web/run-in-systemd.sh
# Office documents are converted by presOfficeConversionExec (/usr/share/bbb-libreoffice-conversion/convert.sh), which deployments provide
COPY --from=slides / /usr/share/bigbluebutton/blank
# gs reads it when PdfPageDownscaler rewrites a page
COPY --from=slides nopdfmark.ps /etc/bigbluebutton/nopdfmark.ps
COPY --from=html5-config settings.yml /usr/share/bigbluebutton/html5-client/private/config/settings.yml
# The client build id, as the html5 image stamps it
ARG CLIENT_BUILD=0
RUN sed -i "s/HTML5_CLIENT_VERSION/${CLIENT_BUILD}/" /usr/share/bigbluebutton/html5-client/private/config/settings.yml

# Log to stdout only; /var/bigbluebutton is where bbb-web stores presentations and heap dumps
RUN sed -i '/<appender-ref ref="FILE"/d' WEB-INF/classes/logback.xml \
    && install -d -o 998 -g 998 /var/bigbluebutton /var/bigbluebutton/diagnostics

USER 998:998

EXPOSE 8090

HEALTHCHECK --start-period=120s CMD ["curl", "-fsS", "-o", "/dev/null", "http://127.0.0.1:8090/bigbluebutton/api"]

# As ExecStart in build/packages-template/bbb-web/bbb-web.service, listening on all interfaces;
# the heap settings are in an environment variable so that deployments can change them.
ENV MALLOC_ARENA_MAX=2 \
    JDK_JAVA_OPTIONS="-Xms384m -Xmx384m -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/var/bigbluebutton/diagnostics"
ENTRYPOINT ["java", "-Dgrails.env=prod", "-Dserver.address=0.0.0.0", "-Dserver.port=8090", "-Dspring.main.allow-circular-references=true", "-cp", ".", "org.springframework.boot.loader.launch.WarLauncher"]
