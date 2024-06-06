#!/bin/bash

echo "Starting mongoDB"

#wait for mongo startup
MONGO_PORT=27017
while ! netstat -tuln | grep ":$MONGO_PORT " > /dev/null; do
    echo "Waiting for Mongo's port ($MONGO_PORT) to be ready..."
    sleep 1
done

echo "Mongo started";

echo "Initializing replicaset"
mongosh 127.0.1.1 --eval 'rs.initiate({ _id: "rs0", members: [ {_id: 0, host: "127.0.1.1"} ]})'

echo "Waiting to become a master"
IS_MASTER="XX"
while [ "$IS_MASTER" \!= "true" ]; do
    IS_MASTER=$(mongosh mongodb://127.0.1.1:27017/ --eval  'db.isMaster().ismaster' | tail -n 1)
    sleep 0.5;
done;

echo "I'm the master!"

#Allow to run outside of directory
cd $(dirname $0)

PORT=4100

# this might be already set by a systemd unit override in case this node is run
# behind a load balancer proxy node
if [[ -z $ROOT_URL ]] ; then
  export ROOT_URL=http://127.0.0.1/html5client
fi
export MONGO_OPLOG_URL=mongodb://127.0.1.1/local
export MONGO_URL=mongodb://127.0.1.1/meteor
export NODE_ENV=production
export SERVER_WEBSOCKET_COMPRESSION='{"level":5, "maxWindowBits":13, "memLevel":7, "requestMaxWindowBits":13}'
export BIND_IP=127.0.0.1
PORT=$PORT /usr/lib/bbb-html5/node/bin/node --max-old-space-size=2048 --max_semi_space_size=128 main.js
