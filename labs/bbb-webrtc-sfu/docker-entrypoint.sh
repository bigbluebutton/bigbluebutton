#!/bin/bash -e

CONTAINER_IP=$(hostname -I | awk '{print $1}')

sed -i "s|^\(localIpAddress\):.*|\1: \"$CONTAINER_IP\"|g" config/production.yml

if [ ! -z "$KURENTO_NAME" ]; then
    export KURENTO_IP=$(getent hosts $KURENTO_NAME | awk '{ print $1 }')
fi

npm start
