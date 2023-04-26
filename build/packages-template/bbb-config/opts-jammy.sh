. ./opts-global.sh

AKKA_APPS="bbb-fsesl-akka,bbb-apps-akka"
OPTS="$OPTS -t deb -d netcat-openbsd,stun-client,bbb-html5,bbb-playback-presentation,bbb-playback,bbb-freeswitch-core,$AKKA_APPS"
