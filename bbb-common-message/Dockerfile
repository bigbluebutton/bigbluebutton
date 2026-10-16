FROM sbtscala/scala-sbt:eclipse-temurin-21.0.7_6_1.10.11_2.13.16

RUN apt-get update && apt-get install -y unzip

WORKDIR /bbb-comomon-message

COPY . .

# build bbb-common-message
RUN ./deploy.sh
