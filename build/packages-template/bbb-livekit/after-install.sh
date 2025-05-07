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

else
  # If livekit.yaml exists, extract the API key and secret
  API_KEY=$(yq e '.keys | keys | .[0]' /etc/bigbluebutton/livekit.yaml)
  API_SECRET=$(yq e ".keys.[\"$API_KEY\"]" /etc/bigbluebutton/livekit.yaml)
fi

# Update bbb-webrtc-sfu's and recorder's overrides with the generated keys.
# We're opting not to use the /usr/local file because it may be overwritten
# on package upgrades. It also only runs when livekit installed and secrets
# are not set on apps, so it won't overwrite any meaningful admin configs.
# This part is *temporary* to facilitate testing while the pkg is experimental.
# We MUST move it to the SFU/recorder packages (and use the /usr/local file instead)
# after bbb-livekit becomes mandatory and bbb-webrtc-sfu/recorder depends on it.
if [ ! -f /etc/bigbluebutton/bbb-webrtc-sfu/production.yml ]; then
  mkdir -p /etc/bigbluebutton/bbb-webrtc-sfu
  touch /etc/bigbluebutton/bbb-webrtc-sfu/production.yml
  chown bigbluebutton:bigbluebutton /etc/bigbluebutton/bbb-webrtc-sfu/production.yml
fi

# If key and secret are not the same as the ones in livekit.yaml, update them
SFU_KEY=$(yq e '.livekit.key' /etc/bigbluebutton/bbb-webrtc-sfu/production.yml)
SFU_SECRET=$(yq e '.livekit.secret' /etc/bigbluebutton/bbb-webrtc-sfu/production.yml)

if [ "$SFU_KEY" = "null" ] || [ -z "$SFU_KEY" ] || [ "$SFU_KEY" != "$API_KEY" ] || \
   [ "$SFU_SECRET" = "null" ] || [ -z "$SFU_SECRET" ] || [ "$SFU_SECRET" != "$API_SECRET" ]; then
  yq e -i ".livekit.key = \"$API_KEY\"" /etc/bigbluebutton/bbb-webrtc-sfu/production.yml
  yq e -i ".livekit.secret = \"$API_SECRET\"" /etc/bigbluebutton/bbb-webrtc-sfu/production.yml
fi

# For the recorder, add as env vars to /etc/default/bbb-webrtc-recorder
if [ ! -f /etc/default/bbb-webrtc-recorder ]; then
  touch /etc/default/bbb-webrtc-recorder
  chown bigbluebutton:bigbluebutton /etc/default/bbb-webrtc-recorder
fi

if ! grep -q "BBBRECORDER_LIVEKIT_APIKEY" /etc/default/bbb-webrtc-recorder; then
  echo "BBBRECORDER_LIVEKIT_APIKEY=$API_KEY" >> /etc/default/bbb-webrtc-recorder
fi

if ! grep -q "BBBRECORDER_LIVEKIT_APISECRET" /etc/default/bbb-webrtc-recorder; then
  echo "BBBRECORDER_LIVEKIT_APISECRET=$API_SECRET" >> /etc/default/bbb-webrtc-recorder
fi

if [ ! -f /.dockerenv ]; then
  systemctl enable livekit-server.service
  systemctl daemon-reload
  reloadService nginx
  startService livekit-server.service || echo "livekit-server service could not be registered or started"
fi
