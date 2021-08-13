#!/bin/bash -ex

TARGET=`basename $(pwd)`
BUILD=$1

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

mkdir -p staging/var/bigbluebutton/activity-report

mkdir -p staging/etc/bigbluebutton/nginx
cp activity-report.nginx staging/etc/bigbluebutton/nginx


# install dependencies, create build, copy build over to destinatino
npm install
npm run build
cp -r build/* staging/var/bigbluebutton/activity-report

##

. ./opts-$DISTRO.sh

fpm -s dir -C ./staging -n $PACKAGE \
    --version $VERSION --epoch $EPOCH \
    --after-install after-install.sh        \
    --after-remove  after-remove.sh        \
    --depends unzip                        \
    --description "BigBlueButton bbb-activity-report" \
    $DIRECTORIES \
    $OPTS

