#!/bin/bash

DESTINATION_DIR=/usr/share/bigbluebutton/nginx
LOCAL_PACKAGING_DIR=/home/bigbluebutton/src/build/packages-template/bbb-html5

if getopts "m:" arg; then
  MODE=$OPTARG
else
  MODE="dev"
fi

if [ "$MODE" != "prod" ] && [ "$MODE" != "dev" ]; then
  echo "Invalid mode, using default mode 'dev'"
  MODE="dev"
fi

echo "Switching nginx config to $MODE mode"

sudo ln -sf $LOCAL_PACKAGING_DIR/bbb-html5-$MODE.nginx $DESTINATION_DIR/bbb-html5.nginx
sudo systemctl reload nginx
