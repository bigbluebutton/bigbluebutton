# Build stage only: publishes bbb-common-message to ~/.m2 for the Java builds that use it.
FROM sbtscala/scala-sbt:eclipse-temurin-21.0.12_8_1.13.0_2.13.18@sha256:8277f225b65954c2741c43b02641dd3429afeb0852df18be6ecb1802dbed38d0

WORKDIR /bbb-common-message

COPY . .

RUN ./deploy.sh
