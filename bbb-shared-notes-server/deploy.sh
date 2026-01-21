#!/usr/bin/env bash

cd "$(dirname "$0")"

for var in "$@"
do
    if [[ $var == --reset ]] ; then
    	echo "Performing a full reset..."
      sudo rm -rf node_modules
    fi
done

if [ ! -d ./node_modules ] ; then
  npm ci --no-progress
fi
npm run build

# create target directory if it doesn't exist
sudo mkdir -p /usr/local/bigbluebutton/bbb-shared-notes-server

sudo mv -f dist/index.js dist/bbb-shared-notes-server.js
sudo cp -rf dist/* /usr/local/bigbluebutton/bbb-shared-notes-server
sudo cp -f package.json /usr/local/bigbluebutton/bbb-shared-notes-server
sudo cp -f package-lock.json /usr/local/bigbluebutton/bbb-shared-notes-server
sudo cp -rf node_modules /usr/local/bigbluebutton/bbb-shared-notes-server

# Copy default settings.json to production config location
sudo mkdir -p /usr/local/bigbluebutton/bbb-shared-notes-server/config
sudo cp -f src/config/settings.json /usr/local/bigbluebutton/bbb-shared-notes-server/config/

# Create template for local overrides if it doesn't exist
if [ ! -f /etc/bigbluebutton/shared-notes-server.json ]; then
    sudo mkdir -p /etc/bigbluebutton
    sudo cp -f src/config/settings.json.template /etc/bigbluebutton/shared-notes-server.json
    echo "Created /etc/bigbluebutton/shared-notes-server.json from template"
fi

# Create SQLite database directory with proper permissions
sudo mkdir -p /var/lib/bbb-shared-notes-server
sudo chown bigbluebutton:bigbluebutton /var/lib/bbb-shared-notes-server
sudo chmod 755 /var/lib/bbb-shared-notes-server
sudo systemctl restart bbb-shared-notes-server
echo ''
echo ''
echo '----------------'
echo 'bbb-shared-notes-server updated'
