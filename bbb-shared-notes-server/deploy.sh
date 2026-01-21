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
  sudo npm ci --no-progress
fi

sudo npm run build

# create target directory if it doesn't exist
sudo mkdir -p /usr/local/bigbluebutton/bbb-shared-notes-server

sudo cp -rf dist/* /usr/local/bigbluebutton/bbb-shared-notes-server
sudo systemctl restart bbb-shared-notes-server
echo ''
echo ''
echo '----------------'
echo 'bbb-shared-notes-server updated'
