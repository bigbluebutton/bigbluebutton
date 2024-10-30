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
DISABLE_ESLINT_PLUGIN=true npm run build

# Compress CSS, Javascript and tensorflow WASM binaries used for virtual backgrounds. Keep the
# uncompressed versions as well so it works with mismatched nginx location blocks
find dist -name '*.js' -exec gzip -k -f -9 '{}' \;
find dist -name '*.css' -exec gzip -k -f -9 '{}' \;
find dist -name '*.wasm' -exec gzip -k -f -9 '{}' \;

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
