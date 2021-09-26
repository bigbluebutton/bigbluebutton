#!/bin/bash -e

chown -R etherpad:etherpad /usr/share/etherpad-lite
chown root:root /usr/lib/systemd/system/etherpad.service

SOURCE=/tmp/settings.json
TARGET=/usr/share/etherpad-lite/settings.json


if [ ! -f /.dockerenv ]; then
  systemctl enable etherpad.service
  systemctl daemon-reload
  startService etherpad.service || echo "bbb-etherpad service could not be registered or started"
fi
