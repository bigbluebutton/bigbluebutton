#!/bin/bash
cd `dirname $0`
#Check if mongo is running and kill it
A=1
while [ "$A" = 1 ]; do
        sleep 0.1
        killall -9 mongod &> /dev/null
        A=`ps aux | grep mongod | grep rs0 | awk  '{print $2}' | grep [0-9] &> /dev/null && echo 1 || echo 0`
done;

