#!/bin/bash -e

apt-get install -y openh264-gst-plugins-bad-1.5

rm -f /etc/kurento/modules/kurento/WebRtcEndpoint.conf.ini
# Generate WebRtcEndpoint configuration
echo "stunServerAddress=$STUN_IP" >> /etc/kurento/modules/kurento/WebRtcEndpoint.conf.ini
echo "stunServerPort=$STUN_PORT" >> /etc/kurento/modules/kurento/WebRtcEndpoint.conf.ini

if [ "$TURN_URL" != "" ]; then
  echo "turnURL=$TURN_URL" >> /etc/kurento/modules/kurento/WebRtcEndpoint.conf.ini
fi

rm -f /etc/kurento/modules/kurento/BaseRtpEndpoint.conf.ini
# Generate BaseRtpEndpoint configuration
echo "minPort=$RTP_MIN_PORT" >> /etc/kurento/modules/kurento/BaseRtpEndpoint.conf.ini
echo "maxPort=$RTP_MAX_PORT" >> /etc/kurento/modules/kurento/BaseRtpEndpoint.conf.ini

CONFIG=$(cat /etc/kurento/kurento.conf.json | sed '/^[ ]*\/\//d' | jq ".mediaServer.net.websocket.port = $PORT")
echo $CONFIG > /etc/kurento/kurento.conf.json

# Remove ipv6 local loop until ipv6 is supported
cat /etc/hosts | sed '/::1/d' | tee /etc/hosts > /dev/null

exec "$@"
