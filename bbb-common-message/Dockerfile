# Build stage only: publishes bbb-common-message to ~/.m2 for the Java builds that use it.
FROM sbtscala/scala-sbt:eclipse-temurin-21.0.12.1_1_1.13.1_2.13.18@sha256:80a4c8a82cddf9f529c0ca5fb8232bf09ecb37540697425c23fd2c1188cd9945

WORKDIR /bbb-common-message

COPY . .

RUN ./deploy.sh
