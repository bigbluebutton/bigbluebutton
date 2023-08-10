#!/bin/bash -e

#Allow to run outside of directory
cd $(dirname $0)

if [ -z $1 ]
then
  INSTANCE_ID=1
else
  INSTANCE_ID=$1
fi

PORT=$(echo "3999+$INSTANCE_ID" | bc)

echo "instanceId = $INSTANCE_ID   and port = $PORT   and role is backend (in backend file)"

export INSTANCE_ID=$INSTANCE_ID
export BBB_HTML5_ROLE=backend
# this might be already set by a systemd unit override in case this node is run
# behind a load balancer proxy node
if [[ -z $ROOT_URL ]] ; then
  export ROOT_URL=http://127.0.0.1/html5client
fi
export MONGO_OPLOG_URL=mongodb://127.0.1.1/local
export MONGO_URL=mongodb://127.0.1.1/meteor
export NODE_ENV=production
export SERVER_WEBSOCKET_COMPRESSION=0
export BIND_IP=127.0.0.1
PORT=$PORT /usr/lib/bbb-html5/node/bin/node --max-old-space-size=2048 --max_semi_space_size=128 main.js NODEJS_BACKEND_INSTANCE_ID=$INSTANCE_ID

