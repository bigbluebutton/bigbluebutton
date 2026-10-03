#!/bin/bash -e

addGroup etherpad ""
addUser etherpad "" etherpad /usr/share/etherpad-lite "etherpad user-daemon" "/bin/false"

if [ ! -f /usr/share/etherpad-lite/APIKEY.txt ]; then
  mkdir -p /usr/share/etherpad-lite
  openssl rand -base64 64 | head -n 1 | sed 's/=//g' | sed 's/+//g' | sed 's/\///g' | tr -d '\n' > /usr/share/etherpad-lite/APIKEY.txt
  chown etherpad:etherpad /usr/share/etherpad-lite/
  chown etherpad:etherpad /usr/share/etherpad-lite/APIKEY.txt
  chmod 644 /usr/share/etherpad-lite/APIKEY.txt
fi

# Drop the previous code tree so no stale files survive an upgrade.
# (Etherpad 1.x kept everything in node_modules/, 3.x in src/ + node-runtime/.)
for dir in node_modules src bin node-runtime; do
  if [ -d "/usr/share/etherpad-lite/$dir" ]; then
    rm -r "/usr/share/etherpad-lite/$dir"
  fi
done
rm -f /usr/share/etherpad-lite/var/minified_*

# Clean out old pads before upgrade
redis-cli keys pad:*            | xargs -r redis-cli del
redis-cli keys sessionstorage:* | xargs -r redis-cli del
redis-cli keys globalAuthor:*   | xargs -r redis-cli del
redis-cli keys token2author:*   | xargs -r redis-cli del
redis-cli keys pad2readonly:*   | xargs -r redis-cli del
redis-cli keys readonly2pad:*   | xargs -r redis-cli del
redis-cli keys ueberDB:*        | xargs -r redis-cli del
