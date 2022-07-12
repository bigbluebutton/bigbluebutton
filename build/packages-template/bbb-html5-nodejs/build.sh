#!/bin/bash -ex

TARGET=`basename $(pwd)`


PACKAGE=$(echo $TARGET | cut -d'_' -f1)
VERSION=$(echo $TARGET | cut -d'_' -f2)
DISTRO=$(echo $TARGET | cut -d'_' -f3)

NODE_VERSION="14.19.3"
NODE_DIRNAME="node-v${NODE_VERSION}-linux-x64"

#
# Clean up directories
rm -rf staging

pushd .
mkdir -p staging/usr/lib/bbb-html5/node
cd staging/usr/lib/bbb-html5/node

wget https://nodejs.org/dist/v${NODE_VERSION}/${NODE_DIRNAME}.tar.gz
tar xfz ${NODE_DIRNAME}.tar.gz
mv ${NODE_DIRNAME}/* .
rmdir ${NODE_DIRNAME}
rm ${NODE_DIRNAME}.tar.gz

popd

##

fpm -s dir -t deb -C ./staging -n $PACKAGE \
    --version $VERSION --epoch $EPOCH \
    --description "Include a specific NodeJS version for bbb-html5" \
    $DIRECTORIES \
    $OPTS
