#!/bin/bash -ex

TARGET=`basename $(pwd)`

PACKAGE=$(echo $TARGET | cut -d'_' -f1)
VERSION=$(echo $TARGET | cut -d'_' -f2)
DISTRO=$(echo $TARGET | cut -d'_' -f3)
TAG=$(echo $TARGET | cut -d'_' -f4)

#
# Clean up directories
rm -rf staging

#
# package

mkdir -p staging/usr/local/bigbluebutton/bbb-graphql-actions-adapter-server-temp

find -maxdepth 1 ! -path . ! -name staging $(printf "! -name %s " $(cat .build-files)) -exec cp -r {} staging/usr/local/bigbluebutton/bbb-graphql-actions-adapter-server-temp/ \;

pushd .
cd staging/usr/local/bigbluebutton/bbb-graphql-actions-adapter-server-temp/
npm -v
npm ci
npm run build
popd

mkdir -p staging/usr/local/bigbluebutton/bbb-graphql-actions-adapter-server
mv staging/usr/local/bigbluebutton/bbb-graphql-actions-adapter-server-temp/dist/* staging/usr/local/bigbluebutton/bbb-graphql-actions-adapter-server/
pushd .
cd staging/usr/local/bigbluebutton/bbb-graphql-actions-adapter-server/
mv index.js bbb-graphql-actions-adapter-server.js
cp ../bbb-graphql-actions-adapter-server-temp/package.json .
cp ../bbb-graphql-actions-adapter-server-temp/package.lock .
npm ci --omit=dev
popd

mkdir -p staging/usr/lib/systemd/system
cp bbb-graphql-actions-adapter-server.service staging/usr/lib/systemd/system

##

. ./opts-$DISTRO.sh

#
# Build package
fpm -s dir -C ./staging -n $PACKAGE \
    --version $VERSION --epoch $EPOCH \
    --after-install after-install.sh \
    --before-remove before-remove.sh \
    --description "BigBlueButton GraphQL Actions Adapter Server" \
    $DIRECTORIES \
    $OPTS \
    -d 'nodejs (>= 18)' -d 'nodejs (<< 20)'

