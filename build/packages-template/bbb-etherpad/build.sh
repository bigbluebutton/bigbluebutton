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

npm install -g pnpm@9.14.4
pnpm -v

ls -l node_modules/
ls -l node_modules/ep_etherpad-lite
ls -l src/

bin/installDeps.sh
set -e

pnpm run plugins i \
    ep_cursortrace@3.1.18 \
    ep_disable_chat@0.0.10 \
    ep_auth_session@1.1.1 \
    --github \
        mconf/ep_pad_ttl#360136cd38493dd698435631f2373cbb7089082d \
        mconf/ep_redis_publisher#2b6e47c1c59362916a0b2961a29b259f2977b694 \
        alangecker/bbb-etherpad-plugin#927747e0e18500f027a91bea2742e6061d388e28

mkdir -p staging/usr/share/etherpad-lite

cp -r CHANGELOG.md CONTRIBUTING.md LICENSE README.md pnpm-workspace.yaml bin doc src tests var node_modules staging/usr/share/etherpad-lite

cp settings.json staging/usr/share/etherpad-lite

git clone https://github.com/alangecker/bbb-etherpad-skin.git staging/usr/share/etherpad-lite/src/static/skins/bigbluebutton
pushd staging/usr/share/etherpad-lite/src/static/skins/bigbluebutton
    git checkout 91b052c2cc4c169f2e381538e4342e894f944dbe
    rm -rf .git
popd

chmod -R a+rX staging/usr/share/etherpad-lite

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
    $OPTS \
    -d 'nodejs (>= 18)' -d 'nodejs (<< 23)'

