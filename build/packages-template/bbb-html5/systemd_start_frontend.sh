#!/bin/bash -e

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
