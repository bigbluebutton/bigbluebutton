#!/usr/bin/env bash

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

sudo cp -rf dist/* /usr/share/bigbluebutton/html5-client/

sudo ln -sf /usr/share/bigbluebutton/nginx/bbb-html5.nginx.static /usr/share/bigbluebutton/nginx/bbb-html5.nginx
sudo systemctl restart nginx

echo ''
echo ''
echo '----------------'
echo 'bbb-html5 updated'
