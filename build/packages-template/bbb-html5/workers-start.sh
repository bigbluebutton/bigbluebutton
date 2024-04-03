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


# Start parallel nodejs processes for bbb-html5. Number varies on restrictions file bbb-html5-with-roles.conf

source /usr/share/meteor/bundle/bbb-html5-with-roles.conf

if [ -f /etc/bigbluebutton/bbb-html5-with-roles.conf ]; then
  source /etc/bigbluebutton/bbb-html5-with-roles.conf
fi

MIN_NUMBER_OF_BACKEND_PROCESSES=1
MAX_NUMBER_OF_BACKEND_PROCESSES=4

MIN_NUMBER_OF_FRONTEND_PROCESSES=0 # 0 means each nodejs process handles both front and backend roles
MAX_NUMBER_OF_FRONTEND_PROCESSES=8


# Start backend nodejs processes
if ((NUMBER_OF_BACKEND_NODEJS_PROCESSES >= MIN_NUMBER_OF_BACKEND_PROCESSES && NUMBER_OF_BACKEND_NODEJS_PROCESSES <= MAX_NUMBER_OF_BACKEND_PROCESSES)); then
  for ((i = 1 ; i <= NUMBER_OF_BACKEND_NODEJS_PROCESSES ; i++)); do
    systemctl start bbb-html5-backend@$i
  done
fi


# Start frontend nodejs processes
if ((NUMBER_OF_FRONTEND_NODEJS_PROCESSES >= MIN_NUMBER_OF_FRONTEND_PROCESSES && NUMBER_OF_FRONTEND_NODEJS_PROCESSES <= MAX_NUMBER_OF_FRONTEND_PROCESSES)); then
  if ((NUMBER_OF_FRONTEND_NODEJS_PROCESSES == 0)); then
    echo 'Need to modify bbb-html5.nginx to ensure backend IPs are used'
  fi
  for ((i = 1 ; i <= NUMBER_OF_FRONTEND_NODEJS_PROCESSES ; i++)); do
    systemctl start bbb-html5-frontend@$i
  done
fi

