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

set +e

# as of March 12, 2022, circa BigBlueButton 2.5-alpha4, we set npm by default to 8.5.0
# however, it seems bbb-etherpad has troubles building with npm as high.
# Setting npm to 6.14.11 which was used successfully for building in BigBlueButton 2.4.x
npm -v
npm i -g npm@6.14.11
npm -v

ls -l node_modules/
ls -l node_modules/ep_etherpad-lite
ls -l src/
# rm -f node_modules/ep_etherpad-lite/package.json # Was preventing npm ci running, see https://github.com/ether/etherpad-lite/issues/4962#issuecomment-916642078
bin/installDeps.sh
set -e

rm -rf ep_pad_ttl
git clone https://github.com/mconf/ep_pad_ttl.git
npm pack ./ep_pad_ttl
npm install ./ep_pad_ttl-*.tgz

rm -rf bbb-etherpad-plugin
git clone https://github.com/alangecker/bbb-etherpad-plugin.git
npm pack ./bbb-etherpad-plugin
npm install ./ep_bigbluebutton_patches-*.tgz

rm -rf ep_redis_publisher
git clone https://github.com/mconf/ep_redis_publisher.git
npm pack ./ep_redis_publisher
npm install ./ep_redis_publisher-*.tgz

npm install ep_cursortrace
npm install ep_disable_chat
npm install --no-save --legacy-peer-deps ep_auth_session

mkdir -p staging/usr/share/etherpad-lite

cp -r CHANGELOG.md CONTRIBUTING.md LICENSE README.md bin doc src tests var node_modules staging/usr/share/etherpad-lite

cp settings.json staging/usr/share/etherpad-lite
git clone https://github.com/alangecker/bbb-etherpad-skin.git staging/usr/share/etherpad-lite/src/static/skins/bigbluebutton

mkdir -p staging/usr/lib/systemd/system
cp etherpad.service staging/usr/lib/systemd/system

mkdir -p staging/usr/share/bigbluebutton/nginx
cp notes.nginx staging/usr/share/bigbluebutton/nginx

rm -rf staging/usr/share/etherpad-lite/src/static/skins/bigbluebutton/.git

##

. ./opts-$DISTRO.sh

#
# Build RPM package
fpm -s dir -C ./staging -n $PACKAGE \
    --version $VERSION --epoch $EPOCH \
    --before-install before-install.sh \
    --after-install after-install.sh \
    --before-remove before-remove.sh \
    --after-remove after-remove.sh \
    --description "The EtherPad Lite components for BigBlueButton" \
    $DIRECTORIES \
    $OPTS

