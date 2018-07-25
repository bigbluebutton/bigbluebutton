#!/bin/bash -x
set -e

apt-get install -y openh264-gst-plugins-bad-1.5

echo | tee /etc/kurento/modules/kurento/WebRtcEndpoint.conf.ini

if [ -n "$KMS_TURN_URL" ]; then
  echo "turnURL=$KMS_TURN_URL" | tee -a /etc/kurento/modules/kurento/WebRtcEndpoint.conf.ini
fi

if [ -n "$KMS_STUN_IP" -a -n "$KMS_STUN_PORT" ]; then
  # Generate WebRtcEndpoint configuration
  echo "stunServerAddress=$KMS_STUN_IP" | tee -a /etc/kurento/modules/kurento/WebRtcEndpoint.conf.ini
  echo "stunServerPort=$KMS_STUN_PORT" | tee -a /etc/kurento/modules/kurento/WebRtcEndpoint.conf.ini
fi

# Remove ipv6 local loop until ipv6 is supported
cat /etc/hosts | sed '/::1/d' | tee /etc/hosts > /dev/null

exec /usr/bin/kurento-media-server "$@"
