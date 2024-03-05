#!/bin/bash -ex

TARGET=`basename $(pwd)`

SERVER_VERSION=1.5.1
CLI_VERSION=1.3.0

PACKAGE=$(echo $TARGET | cut -d'_' -f1)
VERSION=$(echo $TARGET | cut -d'_' -f2)
DISTRO=$(echo $TARGET | cut -d'_' -f3)

BUILDDIR=$PWD
DESTDIR=$BUILDDIR/staging

#
# Clear staging directory for build

rm -rf $DESTDIR
mkdir -p $DESTDIR

. ./opts-$DISTRO.sh

mkdir -p $DESTDIR/usr/share/bigbluebutton/nginx
cp livekit.nginx $DESTDIR/usr/share/bigbluebutton/nginx

mkdir -p $DESTDIR/lib/systemd/system/
cp livekit-server.service $DESTDIR/lib/systemd/system

mkdir -p $DESTDIR/usr/share/livekit-server
cp livekit.yaml $DESTDIR/usr/share/livekit-server

mkdir -p $DESTDIR/usr/bin

curl https://github.com/livekit/livekit/releases/download/v${SERVER_VERSION}/livekit_${SERVER_VERSION}_linux_amd64.tar.gz  -Lo - | tar -C $DESTDIR/usr/bin -xzf - livekit-server
curl https://github.com/livekit/livekit-cli/releases/download/v${CLI_VERSION}/livekit-cli_${CLI_VERSION}_linux_amd64.tar.gz -Lo - | tar -C $DESTDIR/usr/bin -xzf - livekit-cli

fpm -s dir -C $DESTDIR -n $PACKAGE \
    --version $VERSION --epoch 2 \
    --before-install before-install.sh      \
    --after-install after-install.sh        \
    --before-remove before-remove.sh        \
    --after-remove after-remove.sh         \
    --description "BigBlueButton build of LiveKit Server" \
    $DIRECTORIES                            \
    $OPTS
