#!/bin/bash -e

CONTAINER_IP=$(hostname -I | awk '{print $1}')

sed -i "s|^\(localIpAddress\):.*|\1: \"$CONTAINER_IP\"|g" config/production.yml
sed -i "s|^\(kurentoIp\):.*|\1: \"$KURENTO_IP\"|g" config/production.yml

node server.js
