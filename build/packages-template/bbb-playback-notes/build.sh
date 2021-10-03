#!/bin/bash -ex

TARGET=`basename $(pwd)`


PACKAGE=$(echo $TARGET | cut -d'_' -f1)
VERSION=$(echo $TARGET | cut -d'_' -f2)
DISTRO=$(echo $TARGET | cut -d'_' -f3)

#
# Clear staging directory for build
rm -rf staging

#
# Create build directories for markign by fpm
DIRS=""
for dir in $DIRS; do
  mkdir -p staging$dir
  DIRECTORIES="$DIRECTORIES --directories $dir"
done

##

mkdir -p staging/usr/local/bigbluebutton/core
cp -r scripts staging/usr/local/bigbluebutton/core

chmod +x staging/usr/local/bigbluebutton/core/scripts/process/notes.rb
chmod +x staging/usr/local/bigbluebutton/core/scripts/publish/notes.rb

mkdir -p staging/etc/bigbluebutton/nginx
cp scripts/notes-playback.nginx staging/etc/bigbluebutton/nginx

##

. ./opts-$DISTRO.sh

#
# Build package
fpm -s dir -C ./staging -n $PACKAGE \
    --version $VERSION --epoch $EPOCH \
    --post-install before-install.sh \
    --after-install after-install.sh \
    --description "BigBluebutton playback of notes" \
    $DIRECTORIES \
    $OPTS

