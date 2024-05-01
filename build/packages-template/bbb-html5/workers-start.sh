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

# source /usr/share/meteor/bundle/bbb-html5-with-roles.conf

# if [ -f /etc/bigbluebutton/bbb-html5-with-roles.conf ]; then
#   source /etc/bigbluebutton/bbb-html5-with-roles.conf
# fi


systemctl start bbb-html5-frontend
