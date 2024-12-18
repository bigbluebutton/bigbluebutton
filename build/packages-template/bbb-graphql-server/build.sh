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

# Create directories for fpm to process
DIRS="/usr/bin /etc/default /usr/share/bbb-graphql-server /lib/systemd/system"
for dir in $DIRS; do
  mkdir -p staging$dir
done

HASURA_VERSION=v2.45.0

git clone --branch $HASURA_VERSION https://github.com/iMDT/hasura-graphql-engine.git
cat hasura-graphql-engine/hasura-graphql.part-a* > hasura-graphql
rm -rf hasura-graphql-engine/
chmod +x hasura-graphql
cp -r hasura-graphql staging/usr/bin/hasura-graphql-engine

cp -r hasura-config.env staging/etc/default/bbb-graphql-server
cp -r bbb_schema.sql metadata config.yaml staging/usr/share/bbb-graphql-server
chmod -R a+rX staging/usr/share/bbb-graphql-server

#Copy BBB configs for Postgres
POSTGRES_MAJOR_VERSION=14
mkdir -p staging/etc/postgresql/$POSTGRES_MAJOR_VERSION/main/conf.d
cp bbb-pg.conf staging/etc/postgresql/$POSTGRES_MAJOR_VERSION/main/conf.d

cp bbb-graphql-server.service staging/lib/systemd/system/bbb-graphql-server.service

# Install Hasura CLI
curl -L https://github.com/hasura/graphql-engine/raw/stable/cli/get.sh | INSTALL_PATH=staging/usr/bin VERSION=$HASURA_VERSION bash


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
