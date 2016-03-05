##!/usr/bin/env bash
#sudo chmod -R 777 /usr/share/red5/webapps
#gradle clean war deploy
#sudo chmod -R 777 /usr/share/red5/webapps

#!/bin/bash
# deploying 'screenshare' to /usr/share/red5/webapps

sbt clean
sbt compile
sbt package
sudo rm -r /usr/share/red5/webapps/screenshare
sudo cp -r target/webapp/ /usr/share/red5/webapps/screenshare


sudo rm -rf /usr/share/red5/webapps/screenshare/WEB-INF/lib/*
sudo cp ~/dev/bigbluebutton/bbb-screenshare/app/target/webapp/WEB-INF/lib/bbb-screenshare-akka_2.11-0.0.1.jar \
 ~/dev/bigbluebutton/bbb-screenshare/app/target/webapp/WEB-INF/lib/scala-library-* \
 ~/dev/bigbluebutton/bbb-screenshare/app/target/webapp/WEB-INF/lib/akka-* \
 ~/dev/bigbluebutton/bbb-screenshare/app/target/webapp/WEB-INF/lib/config-1.3.0.jar \
  /usr/share/red5/webapps/screenshare/WEB-INF/lib/


sudo mkdir /usr/share/red5/webapps/screenshare/WEB-INF/classes
cd /usr/share/red5/webapps/screenshare/WEB-INF/classes/
sudo jar -xf ../lib/bbb-screenshare-akka_2.11-0.0.1.jar
sudo rm /usr/share/red5/webapps/screenshare/WEB-INF/lib/bbb-screenshare-akka_2.11-0.0.1.jar

sudo chmod -R 777 /usr/share/red5/webapps/screenshare
sudo chown -R red5:red5 /usr/share/red5/webapps/screenshare

# TODO change the owner username to 'firstuser'

