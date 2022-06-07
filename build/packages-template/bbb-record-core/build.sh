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
DIRS="/usr/local/bigbluebutton/core \
      /etc/logrotate.d \
      /var/bigbluebutton/recording/status/ended \
      /var/bigbluebutton/captions/inbox \
      /var/bigbluebutton/recording/status"
for dir in $DIRS; do
  mkdir -p staging$dir
done

##

mkdir -p staging/var/log/bigbluebutton
cp -r scripts lib Gemfile Gemfile.lock  staging/usr/local/bigbluebutton/core

if [ "$DISTRO" == "bionic" ]; then
  cp Rakefile  staging/usr/local/bigbluebutton/core
fi


cp bbb-record-core.logrotate staging/etc/logrotate.d

mkdir -p staging/usr/lib/systemd/system
cp systemd/* staging/usr/lib/systemd/system

if [ -f "staging/usr/local/bigbluebutton/core/scripts/basic_stats.nginx" ]; then \
  mkdir -p staging/etc/bigbluebutton/nginx; \
  mv staging/usr/local/bigbluebutton/core/scripts/basic_stats.nginx staging/etc/bigbluebutton/nginx; \
fi

##

. ./opts-$DISTRO.sh

fpm -s dir -C ./staging -n $PACKAGE \
    --version $VERSION --epoch $EPOCH \
    --before-install before-install.sh        \
    --after-install after-install.sh    \
    --before-remove before-remove.sh    \
    --description "BigBlueButton record and playback" \
    $DIRECTORIES \
    $OPTS
