#!/usr/bin/env bash

echo "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
echo "  **** This is for development only *****"
echo " "
echo " Make sure you change permissions to /var/bigbluebutton/"
echo " to allow bbb-web to write to the directory. "
echo " "
echo " chmod -R 777 /var/bigbluebutton/"
echo " "
echo "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"

sudo service bbb-web stop

exec grails prod run-app --port 8090 -reloading
