#!/usr/bin/env bash
if [ "$EUID" -ne 0 ]; then
	echo "Please run this script as root ( or with sudo )" ;
	exit 1;
fi;


cd "$(dirname "$0")"

for var in "$@"
do
    if [[ $var == --reset ]] ; then
    	echo "Performing a full reset..."
      rm -rf node_modules
    fi
done

if [ ! -d ./node_modules ] ; then
  npm ci --no-progress
fi

npm run build

# handle renaming circa dec 2023
if [[ -d /usr/local/bigbluebutton/bbb-graphql-actions-adapter-server ]] ; then
    sudo systemctl stop bbb-graphql-actions-adapter-server
    sudo rm -f /usr/lib/systemd/system/bbb-graphql-actions-adapter-server.service
    sudo systemctl daemon-reload
    sudo rm -rf /usr/local/bigbluebutton/bbb-graphql-actions-adapter-server
fi

mv -f dist/index.js dist/bbb-graphql-actions.js
sudo cp -rf dist/* /usr/local/bigbluebutton/bbb-graphql-actions
sudo systemctl restart bbb-graphql-actions
echo ''
echo ''
echo '----------------'
echo 'bbb-graphql-actions updated'
