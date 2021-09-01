#!/bin/bash
cd `dirname $0`
./kill_mongo.sh
rm /mnt/mongo-ramdisk/* -rf
mkdir /mnt/mongo-ramdisk/ &> /dev/null
umount /mnt/mongo-ramdisk/  &> /dev/null
if [ ! -f /.dockerenv ]; then
  mount -t tmpfs -o size=512m tmpfs /mnt/mongo-ramdisk/ 
fi

nohup mongod --config ./mongo-ramdisk.conf --oplogSize 8 --replSet rs0 --noauth --nojournal &> /dev/null &


#wait for mongo startup
MONGO_OK=0

while [ "$MONGO_OK" = "0" ]; do
    MONGO_OK=`netstat -lan | grep 127.0.1.1 | grep 27017 &> /dev/null && echo 1 || echo 0`
    sleep 1;
done;

echo "Mongo started";

echo "Initializing replicaset"
mongo 127.0.1.1 --eval 'rs.initiate({ _id: "rs0", members: [ {_id: 0, host: "127.0.1.1"} ]})'


echo "Waiting to become a master"
IS_MASTER="XX"
while [ "$IS_MASTER" \!= "true" ]; do
    IS_MASTER=`mongo mongodb://127.0.1.1:27017/ --eval  'db.isMaster().ismaster' | tail -n 1`
    sleep 0.5;
done;

echo "I'm the master!"

