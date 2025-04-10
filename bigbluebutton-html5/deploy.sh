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

rm -rf dist

npm run build-safari && npm run build

cd dist
HASH=$(ls | grep -Eo 'bundle\.[a-f0-9]{20}\.js' | head -n 1 | grep -Eo '[a-f0-9]{20}')
if [ -z "$HASH" ]; then
  echo "Bundle hash not found."
else
  for FILE in *.safari.js *.safari.js.map; do
    if [[ "$FILE" == *"$HASH"* ]]; then
      continue
    fi

    PREFIX="${FILE%%.safari.js*}"
    SUFFIX="${FILE#*.safari.js}"  #".js" or ".js.map"
    NEW_NAME="${PREFIX}.${HASH}.safari.js${SUFFIX}"

    echo "Renaming $FILE → $NEW_NAME"
    mv "$FILE" "$NEW_NAME"
  done
fi
cd ..

sudo cp -rf dist/* /usr/share/bigbluebutton/html5-client/

sudo ln -sf /usr/share/bigbluebutton/nginx/bbb-html5.nginx.static /usr/share/bigbluebutton/nginx/bbb-html5.nginx
sudo systemctl restart nginx

echo ''
echo ''
echo '----------------'
echo 'bbb-html5 updated'
