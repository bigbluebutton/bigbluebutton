#!/bin/bash -e

CONTAINER_IP=$(hostname -I | awk '{print $1}')

sed -i "s|^\(localIpAddress\):.*|\1: \"$CONTAINER_IP\"|g" config/production.yml

npm start
