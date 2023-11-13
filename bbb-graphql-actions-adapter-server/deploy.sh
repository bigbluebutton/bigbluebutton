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

mv -f dist/index.js dist/bbb-graphql-actions-adapter-server.js
sudo cp -rf dist/* /usr/local/bigbluebutton/bbb-graphql-actions-adapter-server/
sudo systemctl restart bbb-graphql-actions-adapter-server
echo ''
echo ''
echo '----------------'
echo 'bbb-graphql-actions-adapter-server updated'
