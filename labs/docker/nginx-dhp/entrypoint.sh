#!/bin/sh -xe

if [ ! -f /data/dhp-2048.pem ]; then
  openssl dhparam -out /data/dhp-2048.pem 2048
fi

