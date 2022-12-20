#!/bin/bash -e

#Allow to run outside of directory
cd $(dirname $0)

echo "Starting mongoDB"

#wait for mongo startup
MONGO_OK=0

while [ "$MONGO_OK" = "0" ]; do
    MONGO_OK=$(ss -lan | grep 127.0.1.1 | grep 27017 &> /dev/null && echo 1 || echo 0)
    sleep 1;
done;

echo "Mongo started";

echo "Initializing replicaset"
mongo 127.0.1.1 --eval 'rs.initiate({ _id: "rs0", members: [ {_id: 0, host: "127.0.1.1"} ]})'


echo "Waiting to become a master"
IS_MASTER="XX"
while [ "$IS_MASTER" \!= "true" ]; do
    IS_MASTER=$(mongo mongodb://127.0.1.1:27017/ --eval  'db.isMaster().ismaster' | tail -n 1)
    sleep 0.5;
done;

echo "I'm the master!"

if [ -z $1 ]
then
  INSTANCE_ID=1
else
  INSTANCE_ID=$1
fi

PORT=$(echo "4099+$INSTANCE_ID" | bc)

echo "instanceId = $INSTANCE_ID   and port = $PORT and role is frontend (in frontend file)"

export INSTANCE_ID=$INSTANCE_ID
export BBB_HTML5_ROLE=frontend
# this might be already set by a systemd unit override in case this node is run
# behind a load balancer proxy node
if [[ -z $ROOT_URL ]] ; then
  export ROOT_URL=http://127.0.0.1/html5client
fi
export MONGO_OPLOG_URL=mongodb://127.0.1.1/local
export MONGO_URL=mongodb://127.0.1.1/meteor
export NODE_ENV=production
export NODE_VERSION=node-v14.21.1-linux-x64
export SERVER_WEBSOCKET_COMPRESSION='{"level":5, "maxWindowBits":13, "memLevel":7, "requestMaxWindowBits":13}'
export BIND_IP=127.0.0.1
PORT=$PORT /usr/share/$NODE_VERSION/bin/node --max-old-space-size=2048 --max_semi_space_size=128 main.js

