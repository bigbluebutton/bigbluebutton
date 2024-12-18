#!/bin/bash -ex

TARGET=`basename $(pwd)`


PACKAGE=$(echo $TARGET | cut -d'_' -f1)
VERSION=$(echo $TARGET | cut -d'_' -f2)
DISTRO=$(echo $TARGET | cut -d'_' -f3)
TAG=$(echo $TARGET | cut -d'_' -f4)
BUILD=$1

# Clean up directories
rm -rf staging
rm -rf ./build

# Create directories for fpm to process
DIRS="/usr/bin /lib/systemd/system /usr/share/bigbluebutton/nginx /usr/share/bbb-graphql-middleware/"
for dir in $DIRS; do
  mkdir -p staging$dir
done

# go mod tidy
go version


CGO_ENABLED=0 go build -o bbb-graphql-middleware cmd/bbb-graphql-middleware/main.go
echo "Build of bbb-graphql-middleware finished"

cp bbb-graphql-middleware staging/usr/bin/bbb-graphql-middleware

mkdir -p staging/etc/nginx/conf.d
cp bbb-graphql-client-settings-cache.conf staging/etc/nginx/conf.d

# Create config file
cp config/config.yml staging/usr/share/bbb-graphql-middleware/config.yml
chmod a+r staging/usr/share/bbb-graphql-middleware/config.yml

cp bbb-graphql-middleware.service staging/lib/systemd/system/bbb-graphql-middleware.service

# Set nginx location
cp graphql.nginx staging/usr/share/bigbluebutton/nginx

. ./opts-$DISTRO.sh

#
# Build package
fpm -s dir -C ./staging -n $PACKAGE \
    --version $VERSION --epoch $EPOCH \
    --after-install after-install.sh \
    --after-remove after-remove.sh \
    --before-install before-install.sh \
    --before-remove before-remove.sh \
    --description "GraphQL middleware component for BigBlueButton" \
    $DIRECTORIES \
    $OPTS
