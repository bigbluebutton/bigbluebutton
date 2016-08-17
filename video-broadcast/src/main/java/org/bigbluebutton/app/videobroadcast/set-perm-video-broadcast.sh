#!/usr/bin/env bash

cd /var/lib/red5/webapps
echo 'Starting with:'
ls -dl video-broadcast
sudo chown root:root video-broadcast
sudo chmod -R 777 video-broadcast

cd video-broadcast

ls -al
sudo chown root:root META-INF
sudo chown red5:red5 streams
sudo chown root:root WEB-INF

echo 'After the procedure:'
ls -al
