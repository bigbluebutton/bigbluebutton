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
DIRS="/etc/bigbluebutton/nginx /usr/local/bigbluebutton/bbb-webrtc-sfu /etc/logrotate.d /usr/lib/systemd/system /etc/cron.hourly"
for dir in $DIRS; do
  mkdir -p staging$dir
done

##

mkdir -p staging/usr/local/bigbluebutton/bbb-webrtc-sfu

find -maxdepth 1 ! -path . ! -name staging $(printf "! -name %s " $(cat .build-files)) -exec cp -r {} staging/usr/local/bigbluebutton/bbb-webrtc-sfu/ \;

pushd .
cd staging/usr/local/bigbluebutton/bbb-webrtc-sfu/

# this is required because it is referenced as a submodule here
rm -rf .git
# npm install expects this to be a git repository
git init

if [ "$DISTRO" == "bionic" ]; then
  # this is a workaround so that the post-install command will find the pegjs binary
  export PATH=$PWD/node_modules/pegjs/bin:$PATH
  npm install --unsafe-perm --production
else
  npm install --unsafe-perm --production
fi

# clean out stuff that is not required in the final package. Most of this are object files from dependant libraries
rm -rf node_modules/mediasoup/worker/out/Release/subprojects
rm -rf node_modules/mediasoup/worker/out/Release/mediasoup-worker.p
rm -rf node_modules/mediasoup/worker/out/Release/deps
popd

cp webrtc-sfu.nginx staging/etc/bigbluebutton/nginx

cp bbb-webrtc-sfu.service staging/usr/lib/systemd/system
cp bbb-webrtc-sfu.logrotate staging/etc/logrotate.d
cp bbb-restart-kms staging/etc/cron.hourly
cp kurento-media-server.service staging/usr/lib/systemd/system
rm -rf staging/usr/local/bigbluebutton/bbb-webrtc-sfu/.git

. ./opts-$DISTRO.sh

fpm -s dir -C ./staging -n $PACKAGE                 \
    --version $VERSION --epoch $EPOCH \
    --after-install after-install.sh                \
    --before-install before-install.sh              \
    --before-remove before-remove.sh                \
    --description "BigBlueButton WebRTC SFU"        \
    $DIRECTORIES                                    \
    $OPTS
