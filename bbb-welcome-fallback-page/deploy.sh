#!/usr/bin/env bash
cd "$(dirname "$0")"

set -e

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

npm run build
#postbuild will rename static to welcome-page-static, as /static is reserved to etherpad

sudo rm -f build/asset-manifest.json

sudo rm -f -r ../bigbluebutton-config/assets/welcome-page-static
sudo cp -r build/* ../bigbluebutton-config/assets

sudo rm -f -r /var/www/bigbluebutton-default/assets/welcome-page-static
sudo cp -r build/* /var/www/bigbluebutton-default/assets
echo ''
echo ''
echo '----------------'
echo 'bbb-welcome-fallback-page updated'
