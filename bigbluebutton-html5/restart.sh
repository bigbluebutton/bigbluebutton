#!/bin/bash -x

ID=`docker ps --format "{{.ID}}" --filter ancestor=bigbluebutton/b2`

if [ "$ID" != "" ]; then
  docker stop $ID
fi
docker build -t bigbluebutton/b2 .

docker run -p 80:80/tcp -p 443:443/tcp -p 1935:1935/tcp -p 5066:5066/tcp -p 3478:3478/udp -p 3478:3478 -v /home/firstuser/dev/bigbluebutton/bigbluebutton-html5:/root/bigbluebutton-html5 --cap-add=NET_ADMIN bigbluebutton/b2 -h 192.168.0.130 > /dev/null

cat << HERE

   docker exec -it `docker ps --format "{{.ID}}" --filter ancestor=bigbluebutton/b2` supervisorctl status
   docker exec -it `docker ps --format "{{.ID}}" --filter ancestor=bigbluebutton/b2` /bin/bash

HERE

ID=`docker ps --format "{{.ID}}" --filter ancestor=bigbluebutton/b2`
