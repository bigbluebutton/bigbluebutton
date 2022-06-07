#!/bin/bash -e

chown etherpad:etherpad /usr/share/etherpad-lite/APIKEY.txt
# minified assets
chown -R etherpad:etherpad /usr/share/etherpad-lite/var
# npm update wants to write this
chown -R etherpad:etherpad /usr/share/etherpad-lite/.config
# etherpad wants to write to this
chown -R etherpad:etherpad /usr/share/etherpad-lite/node_modules
chown root:root /usr/lib/systemd/system/etherpad.service

SOURCE=/tmp/settings.json
TARGET=/usr/share/etherpad-lite/settings.json


if [ ! -f /.dockerenv ]; then
  systemctl enable etherpad.service
  systemctl daemon-reload
  startService etherpad.service || echo "bbb-etherpad service could not be registered or started"
fi
