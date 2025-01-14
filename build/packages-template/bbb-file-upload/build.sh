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

mkdir -p staging/usr/local/bigbluebutton/bbb-file-upload-temp

find -maxdepth 1 ! -path . ! -name staging $(printf "! -name %s " $(cat .build-files)) -exec cp -r {} staging/usr/local/bigbluebutton/bbb-file-upload-temp/ \;

pushd .
cd staging/usr/local/bigbluebutton/bbb-file-upload-temp/
npm -v
npm ci --no-progress
npm run build
popd

mkdir -p staging/usr/local/bigbluebutton/bbb-file-upload
pushd .
cd staging/usr/local/bigbluebutton/bbb-file-upload/
mv ../bbb-file-upload-temp/dist/* .
mv index.js bbb-file-upload.js
cp ../bbb-file-upload-temp/package.json .
cp ../bbb-file-upload-temp/package-lock.json .
npm ci --no-progress --omit=dev
rm -rf ../bbb-file-upload-temp/
popd

mkdir -p staging/usr/lib/systemd/system
cp bbb-file-upload.service staging/usr/lib/systemd/system

echo "List files"
find staging/

##

. ./opts-$DISTRO.sh

#
# Build package
fpm -s dir -C ./staging -n $PACKAGE \
    --version $VERSION --epoch $EPOCH \
    --after-install after-install.sh \
    --before-remove before-remove.sh \
    --description "BigBlueButton File Upload" \
    $DIRECTORIES \
    $OPTS \
    -d 'nodejs (>= 18)' -d 'nodejs (<< 23)'

