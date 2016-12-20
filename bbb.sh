#!/bin/bash

set -x

RED5_DIR=/usr/share/red5
BBB_DIR=$(pwd)

sudo chmod -R 777 $RED5_DIR/webapps/

cd $BBB_DIR

DESKSHARE=$BBB_DIR/bbb-screenshare
VOICE=$BBB_DIR/bbb-voice
VIDEO=$BBB_DIR/bbb-video
APPS=$BBB_DIR/bigbluebutton-apps

echo "Building apps"
cd $APPS
gradle resolveDeps
gradle clean war deploy

echo "Building voice"
cd $VOICE
gradle resolveDeps
gradle clean war deploy

echo "Building video"
cd $VIDEO
gradle resolveDeps
gradle clean war deploy

echo "Building deskshare"
cd $DESKSHARE/app
./deploy.sh

cd $BBB_DIR

sudo chown -R red5.adm $RED5_DIR
sudo chmod -R 777 $RED5_DIR/webapps/

