#!/bin/bash

rm -rf /mnt/mongo-ramdisk/* 
mkdir -p /mnt/mongo-ramdisk
if /bin/findmnt | grep -q "/mnt/mongo-ramdisk"; then
  umount /mnt/mongo-ramdisk/
fi
if [ ! -f /.dockerenv ]; then 
  mount -t tmpfs -o size=512m tmpfs /mnt/mongo-ramdisk
fi

chown -R mongodb:mongodb /mnt/mongo-ramdisk
