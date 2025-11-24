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

HASURA_VERSION=v2.48.1

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
chmod 644 staging/etc/postgresql/$POSTGRES_MAJOR_VERSION/main/conf.d/bbb-pg.conf

cp bbb-graphql-server.service staging/lib/systemd/system/bbb-graphql-server.service
cp bbb-graphql-server@.service staging/lib/systemd/system/bbb-graphql-server@.service

# ============= Begin: Install Hasura CLI =============
# The logic bellow is based on https://github.com/hasura/graphql-engine/raw/stable/cli/get.sh

platform='unknown'
unamestr=`uname`
if [ "$unamestr" == 'Linux' ]; then
    platform='linux'
elif [ "$unamestr" == 'Darwin' ]; then
    platform='darwin'
else
    echo "Unknown OS platform"
    exit 1
fi

arch='unknown'
archstr=`uname -m`
if [ "$archstr" == 'x86_64' ]; then
    arch='amd64'
elif [ "$archstr" == 'arm64' ] || [ "$archstr" == 'aarch64' ]; then
    arch='arm64'
else
    echo "prebuilt binaries for $(arch) architecture not available"
    exit 1
fi

url="https://github.com/hasura/graphql-engine/releases/download/${HASURA_VERSION}/cli-hasura-${platform}-${arch}"

echo "Downloading Hasura CLI from $url"

curl -L -f -o staging/usr/bin/hasura "$url"
chmod +x staging/usr/bin/hasura
staging/usr/bin/hasura version --skip-update-check
# ============= End: Install Hasura CLI =============


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
