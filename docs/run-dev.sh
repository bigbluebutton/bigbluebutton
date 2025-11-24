#!/usr/bin/env bash
cd "$(dirname "$0")"

if [ $(whoami) != 'bigbluebutton' ]; then
	echo "Run run-dev.sh inside the docker container"
	exit 1
fi


for var in "$@"
do
    if [[ $var == --reset ]] ; then
    	echo "Performing a full reset..."
      rm -rf node_modules
    fi
done

if [ ! -d ./node_modules ] ; then
	npm ci
fi

sudo cp bbb-docs.nginx /usr/share/bigbluebutton/nginx/bbb-docs.nginx
sudo systemctl restart nginx

echo ""
echo "----------------------"
echo "You can access https://`hostname`/docs"
echo "----------------------"
echo ""

NODE_ENV=development npx docusaurus start --host 0.0.0.0 --port 3001
