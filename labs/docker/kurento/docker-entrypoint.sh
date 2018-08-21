#!/bin/bash -e

apt-get install -y openh264-gst-plugins-bad-1.5

rm -f /etc/kurento/modules/kurento/WebRtcEndpoint.conf.ini
touch /etc/kurento/modules/kurento/WebRtcEndpoint.conf.ini

if [ -n "$KMS_TURN_URL" ]; then
  echo "turnURL=$KMS_TURN_URL" >> /etc/kurento/modules/kurento/WebRtcEndpoint.conf.ini
fi

if [ -n "$KMS_STUN_IP" -a -n "$KMS_STUN_PORT" ]; then
  # Generate WebRtcEndpoint configuration
  echo "stunServerAddress=$KMS_STUN_IP" >> /etc/kurento/modules/kurento/WebRtcEndpoint.conf.ini
  echo "stunServerPort=$KMS_STUN_PORT" >> /etc/kurento/modules/kurento/WebRtcEndpoint.conf.ini
fi

KMS_CONFIG=$(cat /etc/kurento/kurento.conf.json | sed '/^[ ]*\/\//d' | jq ".mediaServer.net.websocket.port = $PORT")
echo $KMS_CONFIG > /etc/kurento/kurento.conf.json

# Remove ipv6 local loop until ipv6 is supported
cat /etc/hosts | sed '/::1/d' | tee /etc/hosts > /dev/null

exec "$@"
