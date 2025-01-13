#!/bin/bash -e

if [ ! -f /etc/bigbluebutton/livekit.yaml ]; then
  keys="$(livekit-server generate-keys)"
  API_KEY=$(echo $keys | awk '{print $3}')
  API_SECRET=$(echo $keys | awk '{print $6}')
 (umask 007; cat << EOT
# This file will be merged with /usr/share/livekit-server/livekit.yaml
# on startup. Settings specified here will take  precedence.

logging:
  level: debug
keys:
  $API_KEY: $API_SECRET
webhook:
  api_key: $API_KEY

EOT
  ) > /etc/bigbluebutton/livekit.yaml
(umask 007; cat << EOT
# This file will be merged with /usr/share/livekit-server/livekit-sip.yaml
# on startup. Settings specified here will take  precedence.

api_key: $API_KEY
api_secret: $API_SECRET

EOT
  ) > /etc/bigbluebutton/livekit-sip.yaml
  chown bigbluebutton:bigbluebutton /etc/bigbluebutton/livekit.yaml
  chown bigbluebutton:bigbluebutton /etc/bigbluebutton/livekit-sip.yaml

  # Update bbb-webrtc-sfu's production.yml with the generated keys.
  # We're opting not to use the /usr/local file because it may be overwritten
  # on SFU package upgrades. It also only runs when livekit.yaml is missing (i.e.
  # secrets are not set), so it won't overwrite any meaningful admin configs.
  # This part is *temporary* to facilitate testing while the pkg is experimental.
  # Ideally we should move it to the SFU package (and use the /usr/local file instead)
  # after bbb-livekit becomes mandatory and bbb-webrtc-sfu depends on it.
  if [ ! -f /etc/bigbluebutton/bbb-webrtc-sfu/production.yml ]; then
    touch /etc/bigbluebutton/bbb-webrtc-sfu/production.yml
    chown bigbluebutton:bigbluebutton /etc/bigbluebutton/bbb-webrtc-sfu/production.yml
  fi
  yq e -i ".livekit.key = \"$API_KEY\"" /etc/bigbluebutton/bbb-webrtc-sfu/production.yml
  yq e -i ".livekit.secret = \"$API_SECRET\"" /etc/bigbluebutton/bbb-webrtc-sfu/production.yml

fi

if [ ! -f /.dockerenv ]; then
  systemctl enable livekit-server.service
  systemctl daemon-reload
  reloadService nginx
  startService livekit-server.service || echo "livekit-server service could not be registered or started"
fi
