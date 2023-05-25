#!/bin/bash -ex

TARGET=`basename $(pwd)`


PACKAGE=$(echo $TARGET | cut -d'_' -f1)
VERSION=$(echo $TARGET | cut -d'_' -f2)
DISTRO=$(echo $TARGET | cut -d'_' -f3)

NODE_VERSION="14.21.3"
NODE_DIRNAME="node-v${NODE_VERSION}-linux-x64"

#
# Clean up directories
rm -rf staging

pushd .
mkdir -p staging/usr/lib/bbb-html5/node
cd staging/usr/lib/bbb-html5/node

wget --waitretry=30 --timeout=20 --retry-connrefused --retry-on-host-error --retry-on-http-error=404,522 https://static.meteor.com/dev-bundle-node-os/v${NODE_VERSION}/${NODE_DIRNAME}.tar.gz
if [ -f ${NODE_DIRNAME}.tar.gz ]; then
    tar xfz ${NODE_DIRNAME}.tar.gz
    mv ${NODE_DIRNAME}/* .
    rmdir ${NODE_DIRNAME}
    rm ${NODE_DIRNAME}.tar.gz
fi

popd

##

fpm -s dir -t deb -C ./staging -n $PACKAGE \
    --version $VERSION --epoch $EPOCH \
    --description "Include a specific NodeJS version for bbb-html5" \
    $DIRECTORIES \
    $OPTS
