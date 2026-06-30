#!/bin/bash -e

if [ ! -f /etc/bigbluebutton/livekit.yaml ]; then
  keys="$(livekit-server generate-keys)"
  API_KEY=$(echo $keys | awk '{print $3}')
  API_SECRET=$(echo $keys | awk '{print $6}')
 (umask 007; cat << EOT
# This file will be merged with /usr/share/livekit-server/livekit.yaml
# on startup. Settings specified here will take  precedence.

keys:
  $API_KEY: $API_SECRET
webhook:
  api_key: $API_KEY

EOT
  ) > /etc/bigbluebutton/livekit.yaml
fi

# Create livekit-sip.yaml independently of livekit.yaml: on upgrades from a
# pre-SIP install livekit.yaml already exists, so deriving the credentials from
# it here keeps the SIP service from starting without a config file.
if [ ! -f /etc/bigbluebutton/livekit-sip.yaml ]; then
  API_KEY=${API_KEY:-$(yq -r '.webhook.api_key' /etc/bigbluebutton/livekit.yaml)}
  API_SECRET=${API_SECRET:-$(yq -r ".keys.[\"$API_KEY\"]" /etc/bigbluebutton/livekit.yaml)}
(umask 007; cat << EOT
# This file will be merged with /usr/share/livekit-server/livekit-sip.yaml
# on startup. Settings specified here will take  precedence.

api_key: $API_KEY
api_secret: $API_SECRET

EOT
  ) > /etc/bigbluebutton/livekit-sip.yaml
fi

# Enforce ownership for already existing files.
for f in /etc/bigbluebutton/livekit.yaml /etc/bigbluebutton/livekit-sip.yaml; do
  if [ -f "$f" ]; then
    chown bigbluebutton:bigbluebutton "$f"
    chmod 0640 "$f"
  fi
done

if [ ! -f /.dockerenv ]; then
  systemctl enable livekit-server.service
  systemctl enable livekit-sip.service
  systemctl daemon-reload
  reloadService nginx
  startService livekit-server.service || echo "livekit-server service could not be registered or started"
  startService livekit-sip.service || echo "livekit-sip service could not be registered or started"
fi
