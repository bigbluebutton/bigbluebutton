#!/bin/bash -ex

TARGET=`basename $(pwd)`


PACKAGE=$(echo $TARGET | cut -d'_' -f1)
VERSION=$(echo $TARGET | cut -d'_' -f2)
DISTRO=$(echo $TARGET | cut -d'_' -f3)
TAG=$(echo $TARGET | cut -d'_' -f4)
BUILD=$1

#
# Clean up directories
rm -rf staging
rm -rf dist
#
# package
#
# Create directory for fpm to process
DIRS="/usr/share/bigbluebutton/html5-client /usr/share/bigbluebutton/nginx"
for dir in $DIRS; do
  mkdir -p staging$dir
  DIRECTORIES="$DIRECTORIES --directories $dir"
done

cp bbb-html5.nginx staging/usr/share/bigbluebutton/nginx
cp bbb-html5.nginx.dev staging/usr/share/bigbluebutton/nginx
cp bbb-html5.nginx.static staging/usr/share/bigbluebutton/nginx
cp sip.nginx staging/usr/share/bigbluebutton/nginx

# New format
if [ -f private/config/settings.yml ]; then
  sed -i "s/HTML5_CLIENT_VERSION/$(($BUILD))/g" private/config/settings.yml
fi

echo "Npm version:"
npm -v
echo "Node version:"
node -v

CI=true npm ci
DISABLE_ESLINT_PLUGIN=true npm run build-safari && npm run build

#Rename all safari bundle with same hash of the last bundle
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

# Compress CSS, Javascript and tensorflow WASM binaries used for virtual backgrounds. Keep the
# uncompressed versions as well so it works with mismatched nginx location blocks
find dist -name '*.js' -exec gzip -k -f -9 '{}' \;
find dist -name '*.css' -exec gzip -k -f -9 '{}' \;
find dist -name '*.wasm' -exec gzip -k -f -9 '{}' \;

# replace v=VERSION with build number in head and css files
if [ -f dist/index.html ] || [ -f dist/stylesheets/fonts.css ]; then
  sed -i "s/VERSION/$(($BUILD))/g" dist/index.html
  sed -i "s/VERSION/$(($BUILD))/g" dist/stylesheets/fonts.css
fi

cp -r dist/* staging/usr/share/bigbluebutton/html5-client

mkdir -p staging/etc/nginx/sites-available
cp bigbluebutton.nginx staging/etc/nginx/sites-available/bigbluebutton

##

. ./opts-$DISTRO.sh

fpm -s dir -C ./staging -n $PACKAGE \
    --version $VERSION --epoch $EPOCH \
    --before-install before-install.sh \
    --after-install after-install.sh        \
    --after-remove  after-remove.sh        \
    --description "The HTML5 components for BigBlueButton" \
    $DIRECTORIES \
    $OPTS
