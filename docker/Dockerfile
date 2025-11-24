# Build common java-base
FROM eclipse-temurin:17-jre-jammy AS bbb-java-base

RUN apt-get update && apt-get install -y \
    wget unzip gosu locales \
    imagemagick xpdf-utils curl \
    && sed -i '/en_US.UTF-8/s/^# //g' /etc/locale.gen && locale-gen

ENV LANG=en_US.UTF-8
ENV LANGUAGE=en_US:en
ENV LC_ALL=en_US.UTF-8

# add user & group
RUN groupadd -g 998 bigbluebutton \
    && useradd -m -u 998 -g bigbluebutton bigbluebutton \
    && mkdir /etc/bigbluebutton \
    && chown bigbluebutton:bigbluebutton /etc/bigbluebutton

# Build common common-message
FROM sbtscala/scala-sbt:eclipse-temurin-17.0.14_7_1.10.11_2.13.16 AS bbb-common-message

RUN apt-get update && apt-get install -y unzip

WORKDIR /bbb-common-message

COPY ../bbb-common-message .

# build
RUN ./deploy.sh

FROM bbb-common-message AS akka-bbb-apps-build

WORKDIR /bbb-apps-akka

COPY ../akka-bbb-apps .

# compile and unzip bin
RUN sbt universal:packageBin \
    && ls -la ./target/universal/ \
    && unzip ./target/universal/bbb-apps-akka-0.0.4.zip -d /

# 2. Runtime stage:
FROM akka-bbb-apps-build AS akka-bbb-apps

COPY --from=akka-bbb-apps-build /bbb-apps-akka-0.0.4 /bbb-apps-akka
COPY --from=akka-bbb-apps-build /bbb-apps-akka/docker/bbb-apps-akka.conf /etc/bigbluebutton/bbb-apps-akka.conf.tmpl
COPY --from=akka-bbb-apps-build /bbb-apps-akka/docker/entrypoint.sh /entrypoint.sh

USER bigbluebutton
ENTRYPOINT /entrypoint.sh
