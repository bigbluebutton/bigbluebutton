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


for var in "$@"
do
    if [[ $var == --build ]] ; then
       echo "Performing a full re-build..."
       cd ~/src/bbb-common-web
       ./deploy.sh
       cd ~/src/bigbluebutton-web/
       ./build.sh;
    fi
done


sudo service bbb-web stop

BBB_URL=$(grep -s '^BBB_URL=' /etc/bigbluebutton/bigbluebutton.env | tail -n 1 | cut -d= -f2-)
BBB_SECRET=$(grep -s '^BBB_SECRET=' /etc/bigbluebutton/bigbluebutton.env | tail -n 1 | cut -d= -f2-)
export BBB_URL BBB_SECRET

exec ./gradlew bootRun --args='--server.port=8090'
