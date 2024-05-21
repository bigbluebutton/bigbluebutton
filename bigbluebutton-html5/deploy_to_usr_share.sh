#!/bin/sh -ex
cd "$(dirname "$0")"

# Please check bigbluebutton/bigbluebutton-html5/dev_local_deployment/README.md

UPPER_DESTINATION_DIR=/usr/share/meteor
DESTINATION_DIR=$UPPER_DESTINATION_DIR/bundle

SERVICE_FILES_DIR=/usr/lib/systemd/system
LOCAL_PACKAGING_DIR="$(pwd)/../build/packages-template/bbb-html5"

if [ ! -d "$LOCAL_PACKAGING_DIR" ]; then
  echo "Did not find LOCAL_PACKAGING_DIR=$LOCAL_PACKAGING_DIR"
  exit
fi

sudo rm -rf "$UPPER_DESTINATION_DIR"
sudo mkdir -p "$UPPER_DESTINATION_DIR"
sudo chown -R root:root "$UPPER_DESTINATION_DIR"

# the next 5 lines may be temporarily commented out if you are sure you are not tweaking the required node_modules after first use of the script. This will save a minute or two during the run of the script
if [ -d "node_modules" ]; then
   rm -r node_modules/
fi
meteor reset
meteor npm ci --production

sudo chmod 777 /usr/share/meteor
METEOR_DISABLE_OPTIMISTIC_CACHING=1 meteor build $UPPER_DESTINATION_DIR --architecture os.linux.x86_64 --allow-superuser --directory

sudo chown -R root:root "$UPPER_DESTINATION_DIR"/
echo 'stage3'

cd "$DESTINATION_DIR"/programs/server/ || exit
sudo chmod -R 777 .
meteor npm i

echo "deployed to $DESTINATION_DIR/programs/server\n\n\n"

echo "writing $DESTINATION_DIR/mongod_start_pre.sh"
sudo cp $LOCAL_PACKAGING_DIR/mongod_start_pre.sh "$DESTINATION_DIR"/mongod_start_pre.sh

echo "writing $DESTINATION_DIR/mongo-ramdisk.conf"
sudo cp $LOCAL_PACKAGING_DIR/mongo-ramdisk.conf "$DESTINATION_DIR"/mongo-ramdisk.conf

sudo chown -R root:root "$UPPER_DESTINATION_DIR"/
sudo chmod +x "$DESTINATION_DIR"/mongod_start_pre.sh

sudo cp $LOCAL_PACKAGING_DIR/workers-start.sh "$DESTINATION_DIR"/workers-start.sh
sudo chmod +x "$DESTINATION_DIR"/workers-start.sh

echo "writing $SERVICE_FILES_DIR/bbb-html5.service"
sudo cp $LOCAL_PACKAGING_DIR/bbb-html5.service "$SERVICE_FILES_DIR"/bbb-html5.service

sudo systemctl daemon-reload

sudo systemctl restart bbb-html5
