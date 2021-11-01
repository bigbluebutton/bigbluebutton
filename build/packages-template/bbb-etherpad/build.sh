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
bin/installDeps.sh
set -e

git clone https://github.com/pedrobmarin/ep_pad_ttl.git
npm pack ./ep_pad_ttl
npm install ./ep_pad_ttl-*.tgz

git clone https://github.com/alangecker/bbb-etherpad-plugin.git
npm pack ./bbb-etherpad-plugin
npm install ./ep_bigbluebutton_patches-*.tgz

git clone https://github.com/mconf/ep_redis_publisher.git
npm pack ./ep_redis_publisher
npm install ./ep_redis_publisher-*.tgz

# npm install ep_cursortrace
# using mconf's fork due to https://github.com/ether/ep_cursortrace/pull/25 not being accepted upstream
npm install git+https://github.com/mconf/ep_cursortrace.git
npm install ep_disable_chat

# For some reason installing from github using npm 7.5.2 gives
# fatal: could not create leading directories of '/root/.npm/_cacache/tmp/git-clone-76b94572': Permission denied
#
# npm install git+https://git@github.com/alangecker/bbb-etherpad-plugin.git
# npm install git+https://git@github.com/mconf/ep_redis_publisher.git

mkdir -p staging/usr/share/etherpad-lite

cp -r CHANGELOG.md CONTRIBUTING.md LICENSE README.md bin doc src tests var node_modules staging/usr/share/etherpad-lite

cp settings.json staging/usr/share/etherpad-lite
git clone https://github.com/alangecker/bbb-etherpad-skin.git staging/usr/share/etherpad-lite/src/static/skins/bigbluebutton

mkdir -p staging/usr/lib/systemd/system
cp etherpad.service staging/usr/lib/systemd/system

mkdir -p staging/etc/bigbluebutton/nginx
cp notes.nginx staging/etc/bigbluebutton/nginx

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

