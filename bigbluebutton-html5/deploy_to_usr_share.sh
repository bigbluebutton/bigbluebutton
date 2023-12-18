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
sudo chown -R meteor:meteor "$UPPER_DESTINATION_DIR"

# the next 5 lines may be temporarily commented out if you are sure you are not tweaking the required node_modules after first use of the script. This will save a minute or two during the run of the script
if [ -d "node_modules" ]; then
   rm -r node_modules/
fi
meteor reset
meteor npm ci --production

sudo chmod 777 /usr/share/meteor
METEOR_DISABLE_OPTIMISTIC_CACHING=1 meteor build $UPPER_DESTINATION_DIR --architecture os.linux.x86_64 --allow-superuser --directory

sudo chown -R meteor:meteor "$UPPER_DESTINATION_DIR"/
echo 'stage3'


cd "$DESTINATION_DIR"/programs/server/ || exit
sudo chmod -R 777 .
meteor npm i

echo "deployed to $DESTINATION_DIR/programs/server\n\n\n"

echo "writing $DESTINATION_DIR/mongod_start_pre.sh"
sudo cp $LOCAL_PACKAGING_DIR/mongod_start_pre.sh "$DESTINATION_DIR"/mongod_start_pre.sh

echo "writing $DESTINATION_DIR/mongo-ramdisk.conf"
sudo cp $LOCAL_PACKAGING_DIR/mongo-ramdisk.conf "$DESTINATION_DIR"/mongo-ramdisk.conf

echo "writing $DESTINATION_DIR/bbb-html5-with-roles.conf"
sudo tee "$DESTINATION_DIR/bbb-html5-with-roles.conf" >/dev/null <<HERE
# Default = 2; Min = 1; Max = 4
# On powerful systems with high number of meetings you can set values up to 4 to accelerate handling of events
NUMBER_OF_BACKEND_NODEJS_PROCESSES=2
# Default = 2; Min = 0; Max = 8
# If 0 is set, bbb-html5 will handle both backend and frontend roles in one process (default until Feb 2021)
# Set a number between 1 and 4 times the value of NUMBER_OF_BACKEND_NODEJS_PROCESSES where higher number helps with meetings
# stretching the recommended number of users in BigBlueButton
NUMBER_OF_FRONTEND_NODEJS_PROCESSES=2

HERE

echo "writing $DESTINATION_DIR/systemd_start.sh"
sudo cp $LOCAL_PACKAGING_DIR/systemd_start.sh "$DESTINATION_DIR"/systemd_start.sh

echo "writing $DESTINATION_DIR/systemd_start_frontend.sh"
sudo cp $LOCAL_PACKAGING_DIR/systemd_start_frontend.sh "$DESTINATION_DIR"/systemd_start_frontend.sh

sudo chown -R meteor:meteor "$UPPER_DESTINATION_DIR"/
sudo chmod +x "$DESTINATION_DIR"/mongod_start_pre.sh
sudo chmod +x "$DESTINATION_DIR"/systemd_start.sh
sudo chmod +x "$DESTINATION_DIR"/systemd_start_frontend.sh

sudo cp $LOCAL_PACKAGING_DIR/workers-start.sh "$DESTINATION_DIR"/workers-start.sh
sudo chmod +x "$DESTINATION_DIR"/workers-start.sh



echo "writing $SERVICE_FILES_DIR/bbb-html5-frontend@.service"
sudo cp $LOCAL_PACKAGING_DIR/bbb-html5-frontend@.service "$SERVICE_FILES_DIR"/bbb-html5-frontend@.service

echo "writing $SERVICE_FILES_DIR/bbb-html5-backend@.service"
sudo cp $LOCAL_PACKAGING_DIR/bbb-html5-backend@.service "$SERVICE_FILES_DIR"/bbb-html5-backend@.service

sudo systemctl daemon-reload

echo 'before stopping bbb-html5:'
ps -ef | grep node-
sudo ss -netlp | grep -i node
echo 'before stopping bbb-html5:'
echo '_____________'

sudo systemctl stop bbb-html5

sleep 5s
echo 'after stopping bbb-html5:'
ps -ef | grep node-
sudo ss -netlp | grep -i node
echo 'after stopping bbb-html5:'
echo '_____________'

echo 'starting bbb-html5'
sudo systemctl start bbb-html5
sleep 10s
echo 'after:...'
ps -ef | grep node-
sudo ss -netlp | grep -i node
echo 'after:'
echo '_____________'
