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

#sudo mv -f dist/index.js dist/bbb-graphql-actions.js
sudo cp -rf dist/* /var/bigbluebutton/html5-client/

sudo ln -sf /usr/share/bigbluebutton/nginx/bbb-html5.nginx.static /usr/share/bigbluebutton/nginx/bbb-html5.nginx
sudo systemctl restart nginx

echo ''
echo ''
echo '----------------'
echo 'bbb-html5 updated'
