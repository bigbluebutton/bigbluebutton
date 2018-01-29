## BUILD
```
mconf@docker-bbb:~/bigbluebutton/bigbluebutton-html5$ docker build -t bbb-html5 .
mconf@docker-bbb:~/bigbluebutton$ docker build -f sbt.dockerfile -t 'sbt:0.13.8' .
mconf@docker-bbb:~/bigbluebutton$ docker build -f akka-bbb-apps/Dockerfile -t bbb-apps-akka --build-arg COMMON_VERSION=0.0.1-SNAPSHOT .
mconf@docker-bbb:~/bigbluebutton$ docker build -f akka-bbb-transcode/Dockerfile -t bbb-transcode --build-arg COMMON_VERSION=0.0.1-SNAPSHOT .
mconf@docker-bbb:~/bigbluebutton$ docker build -f bigbluebutton-web/Dockerfile -t bbb-web --build-arg COMMON_VERSION=0.0.1-SNAPSHOT --build-arg SBT_VERSION=0.13.8 .  
mconf@docker-bbb:~/bigbluebutton$ docker build -f freeswitch.dockerfile -t bbb-freeswitch .
mconf@docker-bbb:~/bigbluebutton$ docker build -f akka-bbb-fsesl/Dockerfile -t bbb-fsesl-akka --build-arg COMMON_VERSION=0.0.1-SNAPSHOT .
mconf@docker-bbb:~/bigbluebutton$ docker build -f libreoffice.dockerfile -t libreoffice .
mconf@docker-bbb:~/bigbluebutton/labs/bbb-webrtc-sfu$ docker build -t bbb-webrtc-sfu .
```

## RUN
```
docker run --name mongo -d mongo:3.4
docker run --name redis -d redis
docker run --name kurento -d kurento/kurento-media-server:6.6.3
docker run --name bbb-html5 -p 3000:3000 --link mongo --link redis -e MONGO_URL=mongodb://mongo/bbbhtml5 -e METEOR_SETTINGS="$(cat private/config/settings-production.json)" -d bbb-html5
docker run --name bbb-webhooks -p 3005:3005 --link redis -d bbb-webhooks
docker run --name bbb-apps-akka --link redis -d bbb-apps-akka
docker run --name bbb-transcode --link redis -d bbb-transcode
docker run --name bbb-web -p 8080:8080 --link redis -d bbb-web
docker run --name bbb-freeswitch -d bbb-freeswitch
docker run --name bbb-fsesl-akka --link redis --link bbb-freeswitch -d bbb-fsesl-akka
docker run --name libreoffice -p 8100:8100 -d libreoffice
docker run --name bbb-webrtc-sfu -p 3008:3008 -e KURENTO_IP=172.17.0.12 --link redis -d bbb-webrtc-sfu
```

## TODO
- reboot libreoffice in case of failure
- connect bbb-common-web to libreoffice running in a different container (decouple bbb-web from libreoffice)
- configure ip on freeswitch
- configure to connect to redis:
  - akka-bbb-apps/src/main/resources/application.conf
  - akka-bbb-fsesl/src/main/resources/application.conf
  - akka-bbb-transcode/src/main/resources/application.conf
  - bbb-webhooks/config_local.coffee.example
  - bigbluebutton-html5/private/config/settings-production.json
  - bigbluebutton-web/grails-app/conf/application.conf
  - bigbluebutton-web/grails-app/conf/bigbluebutton.properties
  - labs/bbb-webrtc-sfu/config/default.example.yml
- set log filename on bigbluebutton-html5/private/config/settings-production.json to /dev/stdout
- set freeswitch esl host on akka-bbb-fsesl/src/main/resources/application.conf to bbb-freeswitch
- set server URL and secret on bigbluebutton-web/grails-app/conf/bigbluebutton.properties
- set secret on bbb-webhooks/config_local.coffee.example
- remove FileAppender from bigbluebutton-web/grails-app/conf/logback.xml
- set kurentoUrl on labs/bbb-webrtc-sfu/config/default.example.yml to ws://kurento/kurento
- recordings
- reverse proxy using traefik
- docker composer
- UDP ports

