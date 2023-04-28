#!/bin/bash -ex

TARGET=`basename $(pwd)`


PACKAGE=$(echo $TARGET | cut -d'_' -f1)
VERSION=$(echo $TARGET | cut -d'_' -f2)
DISTRO=$(echo $TARGET | cut -d'_' -f3)
TAG=$(echo $TARGET | cut -d'_' -f4)
BUILD=$1

#
# Clean up directories
rm -rf staging

#
# package

git clone --branch v2.22.1 https://github.com/iMDT/hasura-graphql-engine.git #TODO
cat hasura-graphql-engine/hasura-graphql.part-a* > hasura-graphql
rm -rf hasura-graphql-engine/
chmod +x hasura-graphql

mkdir -p staging/usr/local/bin/hasura-graphql-engine
cp -r hasura-graphql staging/usr/local/bin/hasura-graphql-engine

mkdir -p staging/etc/default/bbb-graphql-server
cp -r ./hasura-config.env bbb_schema.sql metadata staging/etc/default/bbb-graphql-server

mkdir -p staging/lib/systemd/system/bbb-graphql-server.service  
cp ./bbb-graphql-server.service staging/lib/systemd/system/bbb-graphql-server.service

mkdir -p staging/usr/share/bigbluebutton/nginx
cp graphql.nginx staging/usr/share/bigbluebutton/nginx

mkdir -p staging/usr/local/bin/hasura
mkdir -p hasura-cli
cd hasura-cli
npm install --save-dev hasura-cli
ls -l node_modules
cp -r node_modules/hasura-cli/* ../staging/usr/local/bin/hasura
cd ..
rm -rf hasura-cli

. ./opts-$DISTRO.sh

#
# Build package
fpm -s dir -C ./staging -n $PACKAGE \
    --version $VERSION --epoch $EPOCH \
    --after-install after-install.sh \
    --after-remove after-remove.sh \
    --before-remove before-remove.sh \
    --description "GraphQL server component for BigBlueButton" \
    $DIRECTORIES \
    $OPTS
