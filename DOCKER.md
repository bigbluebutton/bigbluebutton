## Build

sbt is needed to build the Scala components
```
$ cd labs/docker/sbt/
$ docker build -t 'sbt:0.13.8' .
```

Build libraries
```
$ cd bbb-common-message/
$ docker build -t 'bbb-common-message' --build-arg COMMON_VERSION=0.0.1-SNAPSHOT .

$ cd bbb-common-web/
$ docker build -t 'bbb-common-web' --build-arg COMMON_VERSION=0.0.1-SNAPSHOT .

$ cd bbb-fsesl-client/
$ docker build -t 'bbb-fsesl-client' --build-arg COMMON_VERSION=0.0.1-SNAPSHOT .
```

Build akka components
```
$ cd akka-bbb-apps/
$ docker build -t bbb-apps-akka --build-arg COMMON_VERSION=0.0.1-SNAPSHOT .

# it's not needed, since we're setting up HTML5 only
$ cd akka-bbb-transcode/
$ docker build -t bbb-transcode --build-arg COMMON_VERSION=0.0.1-SNAPSHOT .

$ cd akka-bbb-fsesl/
$ docker build -t bbb-fsesl-akka --build-arg COMMON_VERSION=0.0.1-SNAPSHOT .
```

Build bbb-web
```
$ cd bigbluebutton-web/
$ docker build -t bbb-web --build-arg COMMON_VERSION=0.0.1-SNAPSHOT .
```

Build bbb-html5
```
$ cd bigbluebutton-html5/
$ docker build -t bbb-html5 .
```

Build bbb-webrtc-sfu
```
$ cd labs/bbb-webrtc-sfu/
$ docker build -t bbb-webrtc-sfu .
```

Build bbb-webhooks
```
$ cd bbb-webhooks/
$ docker build -t bbb-webhooks .
```

Build Kurento Media Server
```
$ cd labs/docker/kurento/
$ docker build -t kurento .
```

Build FreeSWITCH
```
$ cd labs/docker/freeswitch/
$ docker build -t bbb-freeswitch .
```

Build nginx
```
$ cd labs/docker/nginx/
$ docker build -t nginx .
```

Build nginx-dhp (used to generate the Diffie-Hellman file)
```
$ cd labs/docker/nginx-dhp/
$ docker build -t nginx-dhp .
```

Build coturn
```
$ cd labs/docker/coturn
$ docker build -t coturn .
```

(Optional) Build bbb-lti

```
$ cd bbb-lti/
$ docker build -t bbb-lti .
```

Build everything with a single command
```
$ cd labs/docker/
$ make release
```

## RUN

Export your configuration as environment variables
```
$ export SERVER_DOMAIN=felipe.dev.mconf.com
$ export EXTERNAL_IP=`dig +short $SERVER_DOMAIN`
$ export SHARED_SECRET=`openssl rand -hex 16`
$ export COTURN_REST_SECRET=`openssl rand -hex 16`
$ export SCREENSHARE_EXTENSION_LINK=https://chrome.google.com/webstore/detail/mconf-screenshare/mbfngdphjegmlbfobcblikeefpidfncb
$ export SCREENSHARE_EXTENSION_KEY=mbfngdphjegmlbfobcblikeefpidfncb
```

Create a volume for the SSL certs

```
$ docker volume create docker_ssl-conf
```

Generate SSL certs

```
$ docker run --rm -p 80:80 -v docker_ssl-conf:/etc/letsencrypt -it certbot/certbot certonly --non-interactive --register-unsafely-without-email --agree-tos --expand --domain $SERVER_DOMAIN --standalone

# certificate path: docker_ssl-conf/live/$SERVER_DOMAIN/fullchain.pem
# key path: docker_ssl-conf/live/$SERVER_DOMAIN/privkey.pem
```

Generate Diffie-Hellman file

```
$ docker run --rm -v docker_ssl-conf:/data -it nginx-dhp

# dh-param path: docker_ssl-conf/dhp-2048.pem
```

Create a volume for the static files

```
$ docker volume create docker_static
$ cd bigbluebutton-config/web/
$ docker run -d --rm --name nginx -v docker_static:/var/www/bigbluebutton-default nginx tail -f /dev/null
$ docker cp . nginx:/var/www/bigbluebutton-default
$ docker exec -it nginx chown -R www-data:www-data /var/www/bigbluebutton-default
$ docker stop nginx

```

Launch everything with docker compose
```
$ cd labs/docker/
$ docker-compose up
```

These are the instructions to run the containers individually
```
$ docker run --rm --name mongo -d mongo:3.4

$ docker run --rm --name redis -d redis

$ docker run --rm --name bbb-html5 --link mongo --link redis -e MONGO_URL=mongodb://mongo/bbbhtml5 -e METEOR_SETTINGS_MODIFIER=".public.kurento.wsUrl = \"wss://${SERVER_DOMAIN}/bbb-webrtc-sfu\" | .public.kurento.enableVideo = true | .public.kurento.enableScreensharing = true | .public.kurento.chromeDefaultExtensionKey = \"${SCREENSHARE_EXTENSION_KEY}\" | .public.kurento.chromeDefaultExtensionLink = \"${SCREENSHARE_EXTENSION_LINK}\"" -e REDIS_HOST=redis -e ROOT_URL=http://127.0.0.1/html5client -d bbb-html5

$ docker run --rm --name bbb-apps-akka --link redis -e REDIS_HOST=redis -d bbb-apps-akka

$ docker run --rm --name bbb-fsesl-akka --link redis --link bbb-freeswitch -e REDIS_HOST=redis -e ESL_HOST=bbb-freeswitch -d bbb-fsesl-akka

$ docker run --rm --name bbb-web --link redis -e REDIS_HOST=redis -e SERVER_DOMAIN=${SERVER_DOMAIN} -e SHARED_SECRET=${SHARED_SECRET} -e TURN_SECRET=${COTURN_REST_SECRET} -v bigbluebutton:/var/bigbluebutton -d bbb-web

$ docker run --rm --name bbb-webrtc-sfu --link redis --link kurento -e KURENTO_IP=${EXTERNAL_IP} -e KURENTO_URL=ws://kurento:8888/kurento -e REDIS_HOST=redis -d bbb-webrtc-sfu

$ docker run --rm --name coturn -v docker_ssl-conf:/etc/nginx/ssl -e SERVER_DOMAIN=${SERVER_DOMAIN} -e SSL_CERT_PATH=/etc/nginx/ssl/live/${SERVER_DOMAIN}/fullchain.pem -e SSL_KEY_PATH=/etc/nginx/ssl/live/${SERVER_DOMAIN}/privkey.pem -e SSL_DHPARAM_PATH=/etc/nginx/ssl/dhp-2048.pem -e SECRET=${COTURN_REST_SECRET} -e EXTERNAL_IP=${EXTERNAL_IP} -e ENABLE_REST_API=1 -e PORT=3478 -e PORT_TLS=5349 -p 3478:3478/udp -p 3478:3478/tcp -p 5349:5349/tcp -d coturn

$ docker run --rm --name bbb-freeswitch --link coturn -d bbb-freeswitch

$ docker run --rm --name bbb-fsesl-akka --link redis --link bbb-freeswitch -e REDIS_HOST=redis -e ESL_HOST=freeswitch -d bbb-fsesl-akka

$ docker run --rm --name nginx --link bbb-freeswitch --link bbb-web --link bbb-html5 --link bbb-webrtc-sfu --link bbb-webhooks -p 80:80 -p 443:443 -v docker_static:/var/www/bigbluebutton-default -v docker_ssl-conf:/etc/nginx/ssl -e SERVER_DOMAIN=${SERVER_DOMAIN} -e SSL_CERT_PATH=/etc/nginx/ssl/live/${SERVER_DOMAIN}/fullchain.pem -e SSL_KEY_PATH=/etc/nginx/ssl/live/${SERVER_DOMAIN}/privkey.pem -e SSL_DHPARAM_PATH=/etc/nginx/ssl/dhp-2048.pem -d nginx

$ docker run --rm --name kurento -e KMS_STUN_IP=${EXTERNAL_IP} -e KMS_STUN_PORT=3478 -d kurento

$ docker run --rm --name bbb-webhooks --link redis -e REDIS_HOST=redis -e SHARED_SECRET=${SHARED_SECRET} -d bbb-webhooks
```
