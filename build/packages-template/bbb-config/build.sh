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
DIRS="/etc/bigbluebutton \
      /usr/lib/systemd/system \
      /var/bigbluebutton/blank \
      /usr/share/bigbluebutton/blank \
      /var/www/bigbluebutton-default/assets"
for dir in $DIRS; do
  mkdir -p staging$dir
  DIRECTORIES="$DIRECTORIES --directories $dir"
done

cp bigbluebutton-release staging/etc/bigbluebutton
cp slides/nopdfmark.ps staging/etc/bigbluebutton

# XXX remove /var/bigbluebutton
cp slides/blank* staging/var/bigbluebutton/blank
cp slides/blank* staging/usr/share/bigbluebutton/blank

cp -r assets/* staging/var/www/bigbluebutton-default/assets

mkdir -p staging/usr/bin
cp bin/bbb-conf bin/bbb-record staging/usr/bin
chmod +x staging/usr/bin/bbb-conf

mkdir -p staging/etc/bigbluebutton/bbb-conf
mkdir -p staging/usr/lib/bbb-conf
cp bin/apply-lib.sh staging/usr/lib/bbb-conf

# Download bbbctl v0.5.0
wget https://raw.githubusercontent.com/defnull/bbbctl/d292591665332513aa4ce0b997440a2b7304ccf6/src/bbbctl.py -O staging/usr/bin/bbbctl

# Check integrity
echo "f5fb826ed5f3132e01d6c9e30b0225f45838e27e2f87424ee5331ce37e9e7abd staging/usr/bin/bbbctl" > bbbctl.sha256
sha256sum -c bbbctl.sha256
rm bbbctl.sha256
chmod 755 staging/usr/bin/bbbctl

mkdir -p staging/etc/cron.daily
cp cron.daily/* staging/etc/cron.daily

mkdir -p staging/etc/cron.hourly
cp cron.hourly/bbb-resync-freeswitch staging/etc/cron.hourly

mkdir -p staging/usr/share/bigbluebutton/nginx

cp include_default.nginx staging/usr/share/bigbluebutton/

cp plugins-assets-cors.nginx staging/usr/share/bigbluebutton/nginx/

cp bigbluebutton.target staging/usr/lib/systemd/system/

# inject dependency to bigbluebutton.target
for unit in freeswitch nginx redis-server postgresql; do
  mkdir -p "staging/usr/lib/systemd/system/${unit}.service.d"
  cp bigbluebutton.conf "staging/usr/lib/systemd/system/${unit}.service.d/"
done

. ./opts-$DISTRO.sh

#
# Build package
fpm -s dir -C ./staging -n $PACKAGE \
    --version $VERSION --epoch $EPOCH \
    --after-install after-install.sh \
    --after-remove after-remove.sh \
    --before-install before-install.sh \
    --description "BigBlueButton configuration utilities" \
    $DIRECTORIES \
    $OPTS
