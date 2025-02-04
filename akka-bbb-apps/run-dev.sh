#!/usr/bin/env bash

sudo service bbb-apps-akka stop

rm -rf src/main/resources
cp -R src/universal/conf src/main/resources

#Set correct sharedSecret and bbbWebAPI
sudo sed -i "s/sharedSecret = \"changeme\"/sharedSecret = \"$(sudo bbb-conf --salt | grep Secret: | cut -d ' ' -f 6)\"/g" src/main/resources/application.conf
sudo sed -i "s/bbbWebAPI = \"https:\/\/192.168.23.33\/bigbluebutton\/api\"/bbbWebAPI = \"https:\/\/$(hostname -f)\/bigbluebutton\/api\"/g" src/main/resources/application.conf

cd ../bbb-common-grpc
sbt compile
cd ../akka-bbb-apps

#sbt update - Resolves and retrieves external dependencies, more details in https://www.scala-sbt.org/1.x/docs/Command-Line-Reference.html
#sbt ~reStart (instead of run) - run with "triggered restart" mode, more details in #https://github.com/spray/sbt-revolver
exec sbt update ~reStart
