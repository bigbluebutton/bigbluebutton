#!/bin/bash -ex

TARGET=`basename $(pwd)`

SERVER_VERSION=1.7.2
CLI_VERSION=2.2.0
SIP_VERSION=0.8.0

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
cp livekit-server.service livekit-sip.service $DESTDIR/lib/systemd/system

mkdir -p $DESTDIR/usr/share/livekit-server
cp livekit.yaml livekit-sip.yaml $DESTDIR/usr/share/livekit-server

mkdir -p $DESTDIR/usr/bin

curl https://github.com/livekit/livekit/releases/download/v${SERVER_VERSION}/livekit_${SERVER_VERSION}_linux_amd64.tar.gz  -Lo - | tar -C $DESTDIR/usr/bin -xzf - livekit-server
curl https://github.com/livekit/livekit-cli/releases/download/v${CLI_VERSION}/lk_${CLI_VERSION}_linux_amd64.tar.gz -Lo - | tar -C $DESTDIR/usr/bin -xzf - lk

apt update && apt install -y pkg-config libopus-dev libopusfile-dev libsoxr-dev

buildbase=$(mktemp -d)
curl https://github.com/livekit/sip/archive/refs/tags/v${SIP_VERSION}.tar.gz -Lo - | tar -xzf - -C $buildbase
pushd $buildbase/sip-${SIP_VERSION}

if [ "$TARGETPLATFORM" = "linux/arm64" ]; then GOARCH=arm64; else GOARCH=amd64; fi && \
    CGO_ENABLED=1 GOOS=linux GOARCH=${GOARCH} GO111MODULE=on go build -a -o livekit-sip ./cmd/livekit-sip

cp livekit-sip $DESTDIR/usr/bin

popd
rm -rf $buildbase

fpm -s dir -C $DESTDIR -n $PACKAGE \
    --version $VERSION --epoch 2 \
    --before-install before-install.sh      \
    --after-install after-install.sh        \
    --before-remove before-remove.sh        \
    --after-remove after-remove.sh         \
    --description "BigBlueButton build of LiveKit Server" \
    $DIRECTORIES                            \
    $OPTS
