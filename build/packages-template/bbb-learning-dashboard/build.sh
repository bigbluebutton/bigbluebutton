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

mkdir -p staging/var/bigbluebutton/learning-dashboard

mkdir -p staging/usr/share/bigbluebutton/nginx
cp learning-dashboard.nginx staging/usr/share/bigbluebutton/nginx


# install dependencies, create build, copy build over to destination
npm ci --omit=dev
DISABLE_ESLINT_PLUGIN=true npm run build
cp -r build/* staging/var/bigbluebutton/learning-dashboard

##

. ./opts-$DISTRO.sh

fpm -s dir -C ./staging -n $PACKAGE \
    --version $VERSION --epoch $EPOCH \
    --before-install before-install.sh \
    --after-install after-install.sh        \
    --after-remove  after-remove.sh        \
    --depends unzip                        \
    --description "BigBlueButton bbb-learning-dashboard" \
    $DIRECTORIES \
    $OPTS

