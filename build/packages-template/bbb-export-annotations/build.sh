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

mkdir -p staging/usr/local/bigbluebutton/bbb-export-annotations
mkdir -p staging/usr/local/share/fonts/

find -maxdepth 1 ! -path . ! -name staging $(printf "! -name %s " $(cat .build-files)) -exec cp -r {} staging/usr/local/bigbluebutton/bbb-export-annotations/ \;

pushd .
cd staging/usr/local/bigbluebutton/bbb-export-annotations/
npm install --production
popd

mkdir -p staging/usr/lib/systemd/system
cp bbb-export-annotations.service staging/usr/lib/systemd/system

#
# Install fonts
cp fonts/* staging/usr/local/share/fonts/

##

. ./opts-$DISTRO.sh

#
# Build package
fpm -s dir -C ./staging -n $PACKAGE \
    --version $VERSION --epoch $EPOCH \
    --after-install after-install.sh \
    --before-remove before-remove.sh \
    --description "BigBlueButton Export Annotations" \
    $DIRECTORIES \
    $OPTS

