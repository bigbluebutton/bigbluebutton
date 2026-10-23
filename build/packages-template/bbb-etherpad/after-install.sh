#!/bin/bash -e

ETHERPAD_HOME=/usr/share/etherpad-lite

# avoid missing directories for fresh install
mkdir -p $ETHERPAD_HOME/.config
mkdir -p $ETHERPAD_HOME/var
mkdir -p $ETHERPAD_HOME/src/plugin_packages

chown etherpad:etherpad $ETHERPAD_HOME/APIKEY.txt

# bbb-pads authenticates on the Etherpad HTTP API with OAuth2 client credentials
# (Etherpad >= 2.0). The shared secret is APIKEY.txt; expose it to Etherpad through
# the environment (settings.json reads ${BBB_PADS_CLIENT_SECRET}).
printf 'BBB_PADS_CLIENT_SECRET=%s\n' "$(cat $ETHERPAD_HOME/APIKEY.txt)" > $ETHERPAD_HOME/APIKEY.env
chown etherpad:etherpad $ETHERPAD_HOME/APIKEY.env
chmod 640 $ETHERPAD_HOME/APIKEY.env

# SESSIONKEY.txt is written next to settings.json on first start
chown etherpad:etherpad $ETHERPAD_HOME
# minified assets, installed_plugins.json
chown -R etherpad:etherpad $ETHERPAD_HOME/var
# plugin manager wants to write this
chown -R etherpad:etherpad $ETHERPAD_HOME/.config
# plugin manager keeps plugins here and links them into src/node_modules
chown -R etherpad:etherpad $ETHERPAD_HOME/src/plugin_packages
chown -h etherpad:etherpad $ETHERPAD_HOME/src/node_modules
chown root:root /usr/lib/systemd/system/etherpad.service

if [ ! -f /.dockerenv ]; then
  systemctl enable etherpad.service
  systemctl daemon-reload
  startService etherpad.service || echo "etherpad service could not be registered or started"
fi
