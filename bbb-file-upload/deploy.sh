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

sudo mv -f dist/index.js dist/bbb-file-upload.js
sudo cp -rf dist/* /usr/local/bigbluebutton/bbb-file-upload
sudo systemctl restart bbb-file-upload
echo ''
echo ''
echo '----------------'
echo 'bbb-file-upload updated'
