#!/bin/bash

. ./opts-global.sh

AKKA_APPS="bbb-fsesl-akka,bbb-apps-akka"
OPTS="$OPTS -t deb -d netcat-openbsd,stun-client,bbb-playback-presentation,bbb-html5,bbb-playback,bbb-freeswitch-core,$AKKA_APPS,bbb-web,yq"
