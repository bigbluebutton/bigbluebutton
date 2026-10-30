# Build stage only: publishes bbb-common-message to ~/.m2 for the Java builds that use it.
FROM sbtscala/scala-sbt:eclipse-temurin-21.0.12_8_1.13.0_2.13.18@sha256:bb964ad5eb711de572bd937a7f8400f06fdeb75613464edb29449dd7a789f21d

WORKDIR /bbb-common-message

COPY . .

RUN ./deploy.sh
