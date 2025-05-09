FROM sbtscala/scala-sbt:eclipse-temurin-17.0.14_7_1.10.11_2.13.16

RUN apt-get update && apt-get install -y unzip

WORKDIR /bbb-comomon-message

COPY . .

# build bbb-common-message
RUN ./deploy.sh
