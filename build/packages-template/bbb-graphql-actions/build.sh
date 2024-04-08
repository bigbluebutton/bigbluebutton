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

mkdir -p staging/usr/local/bigbluebutton/bbb-graphql-actions-temp

find -maxdepth 1 ! -path . ! -name staging $(printf "! -name %s " $(cat .build-files)) -exec cp -r {} staging/usr/local/bigbluebutton/bbb-graphql-actions-temp/ \;

pushd .
cd staging/usr/local/bigbluebutton/bbb-graphql-actions-temp/
npm -v
npm ci --no-progress
npm run build
popd

mkdir -p staging/usr/local/bigbluebutton/bbb-graphql-actions
pushd .
cd staging/usr/local/bigbluebutton/bbb-graphql-actions/
mv ../bbb-graphql-actions-temp/dist/* .
mv index.js bbb-graphql-actions.js
cp ../bbb-graphql-actions-temp/package.json .
cp ../bbb-graphql-actions-temp/package-lock.json .
npm ci --no-progress --omit=dev
rm -rf ../bbb-graphql-actions-temp/
popd

mkdir -p staging/usr/lib/systemd/system
cp bbb-graphql-actions.service staging/usr/lib/systemd/system

echo "List files"
find staging/

##

. ./opts-$DISTRO.sh

#
# Build package
fpm -s dir -C ./staging -n $PACKAGE \
    --version $VERSION --epoch $EPOCH \
    --after-install after-install.sh \
    --before-install before-install.sh \
    --before-remove before-remove.sh \
    --description "BigBlueButton GraphQL Actions" \
    $DIRECTORIES \
    $OPTS \
    -d 'nodejs (>= 18)' -d 'nodejs (<< 20)'

