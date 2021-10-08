#!/bin/bash -ex

TARGET=`basename $(pwd)`


PACKAGE=$(echo $TARGET | cut -d'_' -f1)
VERSION=$(echo $TARGET | cut -d'_' -f2)
DISTRO=$(echo $TARGET | cut -d'_' -f3)

#
# Clean up directories
rm -rf staging

#
# Create directory for fpm to process
DIRS="/etc/bigbluebutton/nginx /usr/local/bigbluebutton/bbb-webhooks"
for dir in $DIRS; do
  mkdir -p staging$dir
done

##

mkdir -p staging/usr/local/bigbluebutton/bbb-webhooks

find -maxdepth 1 ! -path . ! -name staging $(printf "! -name %s " $(cat .build-files)) -exec cp -r {} staging/usr/local/bigbluebutton/bbb-webhooks/ \;

pushd .
cd staging/usr/local/bigbluebutton/bbb-webhooks/
npm install --production
popd

cp webhooks.nginx staging/etc/bigbluebutton/nginx/webhooks.nginx

mkdir -p staging/usr/lib/systemd/system
cp bbb-webhooks.service staging/usr/lib/systemd/system

##

. ./opts-$DISTRO.sh

fpm -s dir -C ./staging -n $PACKAGE                 \
    --version $VERSION --epoch $EPOCH \
    --after-install after-install.sh                \
    --before-install before-install.sh              \
    --before-remove before-remove.sh                \
    --description "BigBlueButton Webhooks"          \
    $DIRECTORIES                                    \
    $OPTS
