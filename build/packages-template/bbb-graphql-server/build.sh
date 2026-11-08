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

# The engine binary is built from source by the BigBlueButton fork of the
# Hasura GraphQL Engine and published as a per-distro release asset. The
# expected sha256 for each distro is pinned here; copy it from the SHA256SUMS
# asset of the release when bumping.
HASURA_BBB_TAG=v2.50.7-bbb.1
declare -A HASURA_SHA256=(
  [jammy]=1c414d6d7ac50bd65eb9157614abb54626ed018a174b98eac17d0860a09f0de3
  [noble]=358c777347dfab50f2a582760767802a0999ad6a3bff414323bbdc9ba8b2a174
)

HASURA_URL="https://github.com/bigbluebutton/hasura-graphql-engine/releases/download/${HASURA_BBB_TAG}/hasura-graphql-engine-${DISTRO}-amd64"
echo "Downloading the Hasura engine from $HASURA_URL"
curl -fsSL --retry 5 --retry-delay 10 --retry-all-errors -o hasura-graphql "$HASURA_URL"
echo "${HASURA_SHA256[$DISTRO]}  hasura-graphql" | sha256sum -c -
chmod +x hasura-graphql
cp -r hasura-graphql staging/usr/bin/hasura-graphql-engine

cp -r hasura-config.env staging/etc/default/bbb-graphql-server
cp -r bbb_schema.sql metadata config.yaml staging/usr/share/bbb-graphql-server
chmod -R a+rX staging/usr/share/bbb-graphql-server

# Machine-readable copyright file (DEP-5) at the path dpkg expects: the engine
# binary is a modified build of an Apache-2.0 licensed work, so the license
# and the modification notice must ship with the package.
install -Dm0644 copyright staging/usr/share/doc/bbb-graphql-server/copyright

#Copy BBB configs for Postgres
POSTGRES_MAJOR_VERSION=16
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

HASURA_CLI_VERSION=v2.50.7
url="https://github.com/hasura/graphql-engine/releases/download/${HASURA_CLI_VERSION}/cli-hasura-${platform}-${arch}"

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
    --description "GraphQL server component for BigBlueButton. Contains a modified build of the Apache-2.0 licensed Hasura GraphQL Engine community edition v2.50.7 (see /usr/share/doc/bbb-graphql-server/copyright)." \
    $DIRECTORIES \
    $OPTS
