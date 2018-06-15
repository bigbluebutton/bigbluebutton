## BUILD
```
mconf@docker-bbb:~/bigbluebutton/bigbluebutton-html5$ docker build -t bbb-html5 .
mconf@docker-bbb:~/bigbluebutton/labs/docker/sbt$ docker build -t 'sbt:0.13.8' .
mconf@docker-bbb:~/bigbluebutton/bbb-common-message$ docker build -t 'bbb-common-message' --build-arg COMMON_VERSION=0.0.1-SNAPSHOT .
mconf@docker-bbb:~/bigbluebutton$ docker build -f akka-bbb-apps/Dockerfile -t bbb-apps-akka --build-arg COMMON_VERSION=0.0.1-SNAPSHOT .
mconf@docker-bbb:~/bigbluebutton$ docker build -f akka-bbb-transcode/Dockerfile -t bbb-transcode --build-arg COMMON_VERSION=0.0.1-SNAPSHOT .
mconf@docker-bbb:~/bigbluebutton/bigbluebutton-web$ docker build -f Dockerfile -t bbb-web --build-arg COMMON_VERSION=0.0.1-SNAPSHOT .
mconf@docker-bbb:~/bigbluebutton$ docker build -f freeswitch.dockerfile -t bbb-freeswitch .
mconf@docker-bbb:~/bigbluebutton$ docker build -f akka-bbb-fsesl/Dockerfile -t bbb-fsesl-akka --build-arg COMMON_VERSION=0.0.1-SNAPSHOT .
mconf@docker-bbb:~/bigbluebutton$ docker build -f libreoffice.dockerfile -t libreoffice .
mconf@docker-bbb:~/bigbluebutton/labs/bbb-webrtc-sfu$ docker build -t bbb-webrtc-sfu .
mconf@docker-bbb:~/bigbluebutton/bbb-webhooks$ docker build -t bbb-webhooks .
mconf@felipe-docker:~/bigbluebutton/labs/docker/kurento$ docker build -t kurento .
docker build -t bbb-lti .
```

## RUN
```
docker run --rm --name bbb-lti -it -e SHARED_SECRET=123456 -e SERVER_DOMAIN=felipe-docker.mconf.com -e LTI_CONSUMERS=demo:welcome,consumer1:secret1 -p 8888:8080 bbb-lti
# docker run --rm --name coturn -p 3478:3478 -p 3478:3478/udp -d kurento/coturn
docker run --rm --name coturn --net host -d kurento/coturn
docker run --rm --name haveged --privileged -d harbur/haveged
docker run --rm --name mongo -d mongo:3.4
docker run --rm --name redis -d redis
# docker run --rm --name kurento -d kurento/kurento-media-server
# docker run --rm --name kurento --net host -d kurento/kurento-media-server
docker run --rm --name kurento --net host -d kurento
docker run --rm --name bbb-html5 --link mongo --link redis -e MONGO_URL=mongodb://mongo/bbbhtml5 -e METEOR_SETTINGS="$(cat private/config/settings-production.json)" -e REDIS_HOST=redis -e ROOT_URL=http://127.0.0.1/html5client -d bbb-html5
docker run --rm --name bbb-webhooks -p 3005:3005 --link redis -e REDIS_HOST=redis -d bbb-webhooks
docker run --rm --name bbb-apps-akka --link redis -e REDIS_HOST=redis -d bbb-apps-akka
docker run --rm --name bbb-transcode --link redis -e REDIS_HOST=redis -d bbb-transcode
docker run --rm --name bbb-web --link redis -e REDIS_HOST=redis -e SERVER_URL=https://felipe-docker.mconf.com -d bbb-web
docker run --rm --name greenlight -v $(pwd)/db/production:/usr/src/app/db/production --env-file greenlight.env -d bigbluebutton/greenlight
docker run --rm --name bbb-freeswitch -d bbb-freeswitch
docker run --rm --name bbb-fsesl-akka --link redis --link bbb-freeswitch -e REDIS_HOST=redis -e ESL_HOST=freeswitch -d bbb-fsesl-akka
docker run --rm --name libreoffice -p 8100:8100 -d libreoffice
# docker run --rm --name bbb-webrtc-sfu -p 3008:3008 --link redis --link kurento --link bbb-transcode -e KURENTO_IP=206.189.162.193 -e KURENTO_URL=ws://kurento:8888/kurento -e TRANSCODE_IP=bbb-transcode -e REDIS_HOST=redis -d bbb-webrtc-sfu
docker run --rm --name bbb-webrtc-sfu -p 3008:3008 --link redis --link bbb-transcode -e KURENTO_IP=206.189.162.193 -e KURENTO_URL=ws://localhost:8888/kurento -e TRANSCODE_IP=bbb-transcode -e REDIS_HOST=redis -d bbb-webrtc-sfu

docker run --rm --name certbot -p 80:80 -v ~/certs:/etc/letsencrypt -it certbot/certbot certonly --non-interactive --register-unsafely-without-email --agree-tos --expand --domain felipe-docker.mconf.com --webroot -w /var/www/bigbluebutton-default/
docker run --rm --name certbot -p 80:80 -v ~/certs:/etc/letsencrypt -it certbot/certbot certonly --non-interactive --register-unsafely-without-email --agree-tos --expand --domain felipe-docker.mconf.com --standalone

openssl dhparam -out /root/dhp-2048.pem 2048

docker run --rm --name nginx --link bbb-webhooks --link bbb-web --link bbb-html5 --link bbb-webrtc-sfu --link greenlight -p 80:80 -p 443:443 -v ~/certs:/etc/letsencrypt -v $(pwd)/dhp-2048.pem:/etc/nginx/ssl/dhp-2048.pem -v $(pwd)/nginx.conf:/etc/nginx/nginx.conf -v $(pwd)/bigbluebutton-client/resources/config.xml.template:/var/www/bigbluebutton/client/conf/config.xml -d nginx

docker exec -ti bbb-web cat webapps/bigbluebutton/WEB-INF/classes/bigbluebutton.properties | grep '^securitySalt=' | cut -d'=' -f2
docker exec -ti redis redis-cli monitor

docker run --rm --name bbb-web --link redis -e -it bbb-web sh -c 'export JAVA_OPTS="$JAVA_OPTS -Djava.security.egd=file:/dev/./urandom -DsecuritySalt=123456 -Dredis.host=redis -Dbigbluebutton.web.serverURL=https://felipe-docker.mconf.com"; sed -i "s|^securerandom\.source=.*|securerandom.source=file:/dev/./urandom|g" $JAVA_HOME/lib/security/java.security; exec catalina.sh run'


docker run --rm -v vconfig:/data -ti tannerfe/alpine-openssl openssl dhparam -out /data/nginx/dhp-2048.pem 2048
```

## TODO
- reboot libreoffice in case of failure
- connect bbb-common-web to libreoffice running in a different container (decouple bbb-web from libreoffice); remove libreoffice from bbb-web image
- configure ip on freeswitch
v configure to connect to redis:
  v akka-bbb-apps/src/main/resources/application.conf
  v akka-bbb-fsesl/src/main/resources/application.conf
  v akka-bbb-transcode/src/main/resources/application.conf
  v bbb-webhooks/config_local.coffee.example
  v bigbluebutton-html5/private/config/settings-production.json
  v bigbluebutton-web/grails-app/conf/application.conf
  v bigbluebutton-web/grails-app/conf/bigbluebutton.properties
  v labs/bbb-webrtc-sfu/config/default.example.yml
- set log filename on bigbluebutton-html5/private/config/settings-production.json to /dev/stdout
- set freeswitch esl host on akka-bbb-fsesl/src/main/resources/application.conf to bbb-freeswitch
- set server URL and secret on bigbluebutton-web/grails-app/conf/bigbluebutton.properties
- set secret on bbb-webhooks/config_local.coffee.example
- remove FileAppender from bigbluebutton-web/grails-app/conf/logback.xml
- set kurentoUrl on labs/bbb-webrtc-sfu/config/default.example.yml to ws://kurento/kurento
- recordings
v reverse proxy using traefik (used nginx instead)
- docker composer
- UDP ports
- generate dhparam
- configure kurento public IP on bbb-webrtc-sfu
- use config library to load the process.env automatically as it is on bbb-webrtc-sfu
- configure custom params on the html5 client
- configure udp ports on coturn
- configure udp ports on kms
- configure udp ports on freeswitch
- explore using stunclient stun.l.google.com 19302 | grep 'Mapped address' | cut -d':' -f2 | sed 's/[[:blank:]]//g' to figure out the public IP
- syncookies when using ufw

Last minute notes:

docker run --rm --name kurento --net host -d kurento
docker run --rm --name mongo -d mongo:3.4
docker run --rm --name redis -d redis
docker run --rm --name coturn --net host -d kurento/coturn
# docker run --rm --name bbb-webrtc-sfu -p 3008:3008 --link redis --link kurento --link bbb-transcode -e KURENTO_IP=206.189.162.193 -e KURENTO_URL=ws://kurento:8888/kurento -e TRANSCODE_IP=bbb-transcode -e REDIS_HOST=redis -d bbb-webrtc-sfu
docker run --rm --name bbb-webrtc-sfu -p 3008:3008 --link redis --link bbb-transcode -e KURENTO_IP=206.189.162.193 -e KURENTO_URL=ws://felipe-docker.mconf.com:8888/kurento -e TRANSCODE_IP=bbb-transcode -e REDIS_HOST=redis -d bbb-webrtc-sfu



docker run --rm --name haveged --privileged -d harbur/haveged
# docker run --rm --name kurento -d kurento/kurento-media-server
# docker run --rm --name kurento --net host -d kurento/kurento-media-server
docker run --rm --name kurento --net host -d kurento

docker run --rm --name bbb-html5 --link mongo --link redis -e MONGO_URL=mongodb://mongo/bbbhtml5 -e METEOR_SETTINGS="$(cat private/config/settings-production.json)" -e REDIS_HOST=redis -e ROOT_URL=http://127.0.0.1/html5client -d bbb-html5
docker run --rm --name bbb-webhooks --link redis -e REDIS_HOST=redis -d bbb-webhooks
docker run --rm --name bbb-apps-akka --link redis -e REDIS_HOST=redis -d bbb-apps-akka
docker run --rm --name bbb-transcode --link redis -e REDIS_HOST=redis -d bbb-transcode
docker run --rm --name bbb-web --link redis -e REDIS_HOST=redis -e SERVER_URL=https://felipe-docker.mconf.com -d bbb-web
docker run --rm --name greenlight -v $(pwd)/db/production:/usr/src/app/db/production --env-file greenlight.env -d bigbluebutton/greenlight
docker run --rm --name bbb-freeswitch -d bbb-freeswitch
docker run --rm --name bbb-fsesl-akka --link redis --link bbb-freeswitch -e REDIS_HOST=redis -e ESL_HOST=freeswitch -d bbb-fsesl-akka
docker run --rm --name libreoffice -p 8100:8100 -d libreoffice

docker run --rm --name certbot -p 80:80 -v ~/certs:/etc/letsencrypt -it certbot/certbot certonly --non-interactive --register-unsafely-without-email --agree-tos --expand --domain felipe-docker.mconf.com --webroot -w /var/www/bigbluebutton-default/
docker run --rm --name certbot -p 80:80 -v ~/certs:/etc/letsencrypt -it certbot/certbot certonly --non-interactive --register-unsafely-without-email --agree-tos --expand --domain felipe-docker.mconf.com --standalone

openssl dhparam -out /root/dhp-2048.pem 2048

docker run --rm --name nginx --link bbb-webhooks --link bbb-web --link bbb-html5 --link bbb-webrtc-sfu --link greenlight -p 80:80 -p 443:443 -v ~/certs:/etc/letsencrypt -v $(pwd)/dhp-2048.pem:/etc/nginx/ssl/dhp-2048.pem -v $(pwd)/nginx.conf:/etc/nginx/nginx.conf -v $(pwd)/bigbluebutton-client/resources/config.xml.template:/var/www/bigbluebutton/client/conf/config.xml -d nginx

docker exec -ti bbb-web cat webapps/bigbluebutton/WEB-INF/classes/bigbluebutton.properties | grep '^securitySalt=' | cut -d'=' -f2
docker exec -ti redis redis-cli monitor

