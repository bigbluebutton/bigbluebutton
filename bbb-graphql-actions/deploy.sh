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

sudo mv -f dist/index.js dist/bbb-graphql-actions.js
sudo cp -rf dist/* /usr/local/bigbluebutton/bbb-graphql-actions
sudo systemctl restart bbb-graphql-actions
echo ''
echo ''
echo '----------------'
echo 'bbb-graphql-actions updated'
