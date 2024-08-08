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
DIRS=""
for dir in $DIRS; do
  mkdir -p staging$dir
  DIRECTORIES="$DIRECTORIES --directories $dir"
done

mkdir -p staging/var/bigbluebutton/html5-client
mkdir -p staging/usr/share/bigbluebutton/html5-client

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

cp -r dist/* staging/var/bigbluebutton/html5-client

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
