#!/bin/bash -ex

TARGET=`basename $(pwd)`

# inject dependency to bigbluebutton.target
for unit in freeswitch nginx redis-server; do
  mkdir -p "staging/lib/systemd/system/${unit}.service.d"
  cp bigbluebutton.conf "staging/lib/systemd/system/${unit}.service.d/"
done


PACKAGE=$(echo $TARGET | cut -d'_' -f1)
VERSION=$(echo $TARGET | cut -d'_' -f2)
DISTRO=$(echo $TARGET | cut -d'_' -f3)

#
# Clear staging directory for build
rm -rf staging

#
# Create build directories for markign by fpm
DIRS="/etc/bigbluebutton \
      /lib/systemd/system \
      /var/bigbluebutton/blank \
      /usr/share/bigbluebutton/blank \
      /var/www/bigbluebutton-default"
for dir in $DIRS; do
  mkdir -p staging$dir
  DIRECTORIES="$DIRECTORIES --directories $dir"
done

cp bigbluebutton-release staging/etc/bigbluebutton
cp slides/nopdfmark.ps staging/etc/bigbluebutton

# XXX remove /var/bigbluebutton
cp slides/blank* staging/var/bigbluebutton/blank
cp slides/blank* staging/usr/share/bigbluebutton/blank

cp -r web/* staging/var/www/bigbluebutton-default

mkdir -p staging/usr/bin
cp bin/bbb-conf bin/bbb-record staging/usr/bin
chmod +x staging/usr/bin/bbb-conf

mkdir -p staging/etc/bigbluebutton/bbb-conf
cp bin/apply-lib.sh staging/etc/bigbluebutton/bbb-conf

mkdir -p staging/etc/cron.daily
cp cron.daily/* staging/etc/cron.daily

mkdir -p staging/etc/cron.hourly
cp cron.hourly/bbb-resync-freeswitch staging/etc/cron.hourly

cp bigbluebutton.target staging/lib/systemd/system/

. ./opts-$DISTRO.sh

#
# Build package
fpm -s dir -C ./staging -n $PACKAGE \
    --version $VERSION --epoch $EPOCH \
    --after-install after-install.sh \
    --before-install before-install.sh \
    --description "BigBlueButton configuration utilities" \
    $DIRECTORIES \
    $OPTS \
    -d 'yq (>= 3)' -d 'yq (<< 4)'
