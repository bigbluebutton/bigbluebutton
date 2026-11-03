# Build stage only: publishes bbb-common-message to ~/.m2 for the Java builds that use it.
FROM sbtscala/scala-sbt:eclipse-temurin-21.0.12.1_1_2.x@sha256:7cd33af05642529b0f2d626d99b145290b67462046e25a34885b45d3b2cad6b9

WORKDIR /bbb-common-message

COPY . .

RUN ./deploy.sh
