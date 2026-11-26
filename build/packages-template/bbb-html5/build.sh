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

# Prefer the build's COMMIT_DATE (e.g. 20260525T143438, same value baked into the
# deb VERSION string in setup-inside-docker.sh) so the client's About dialog and
# the ?v= cache-buster identify each build uniquely. Falls back to the numeric
# BUILD for release builds where COMMIT_DATE is unset.
CLIENT_BUILD="${COMMIT_DATE:-$(($BUILD))}"

echo "Npm version:"
npm -v
echo "Node version:"
node -v

CI=true npm ci --legacy-peer-deps
CLIENT_BUILD="${CLIENT_BUILD}" ./build-client.sh

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
