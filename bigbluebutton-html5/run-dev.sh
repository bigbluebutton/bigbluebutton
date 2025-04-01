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
	npm install
fi

sudo ln -sf /usr/share/bigbluebutton/nginx/bbb-html5.nginx.dev /usr/share/bigbluebutton/nginx/bbb-html5.nginx
sudo systemctl restart nginx

npm start
