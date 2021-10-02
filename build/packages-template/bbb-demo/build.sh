#!/bin/bash -ex

TARGET=`basename $(pwd)`


PACKAGE=$(echo $TARGET | cut -d'_' -f1)
VERSION=$(echo $TARGET | cut -d'_' -f2)
DISTRO=$(echo $TARGET | cut -d'_' -f3)

#
# Clean up directories
rm -rf staging

#
# Create directory for fpm to process
DIRS=""
for dir in $DIRS; do
  mkdir -p staging$dir
  DIRECTORIES="$DIRECTORIES --directories $dir"
done

##

gradle resolveDeps
gradle build

mkdir -p staging/var/tmp
cp build/libs/demo.war staging/var/tmp

mkdir -p staging/etc/bigbluebutton/nginx
cp demo.nginx  staging/etc/bigbluebutton/nginx

##

. ./opts-$DISTRO.sh

fpm -s dir -C ./staging -n $PACKAGE \
    --version $VERSION --epoch $EPOCH \
    --after-install after-install.sh        \
    --after-remove  after-remove.sh        \
    --depends unzip                        \
    --description "BigBlueButton API demos" \
    $DIRECTORIES \
    $OPTS

