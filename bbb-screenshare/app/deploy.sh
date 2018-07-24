#!/bin/bash
# deploying 'screenshare' to /usr/share/red5/webapps

sbt clean
sbt compile
sbt package
if [[ -d /usr/share/red5/webapps/screenshare ]]; then
    sudo rm -r /usr/share/red5/webapps/screenshare
fi
sudo cp -r target/webapp/ /usr/share/red5/webapps/screenshare


sudo rm -rf /usr/share/red5/webapps/screenshare/WEB-INF/lib/*
sudo cp ~/dev/bigbluebutton/bbb-screenshare/app/target/webapp/WEB-INF/lib/bbb-screenshare-akka_2.12-0.0.2.jar \
 ~/dev/bigbluebutton/bbb-screenshare/app/target/webapp/WEB-INF/lib/scala-library-* \
 ~/dev/bigbluebutton/bbb-screenshare/app/target/webapp/WEB-INF/lib/scala-reflect-* \
 ~/dev/bigbluebutton/bbb-screenshare/app/target/webapp/WEB-INF/lib/jackson-* \
 ~/dev/bigbluebutton/bbb-screenshare/app/target/webapp/WEB-INF/lib/paranamer-2.8.jar \
 ~/dev/bigbluebutton/bbb-screenshare/app/target/webapp/WEB-INF/lib/akka-* \
 ~/dev/bigbluebutton/bbb-screenshare/app/target/webapp/WEB-INF/lib/config-1.3.1.jar \
 ~/dev/bigbluebutton/bbb-screenshare/app/target/webapp/WEB-INF/lib/gson-2.5.jar \
 ~/dev/bigbluebutton/bbb-screenshare/app/target/webapp/WEB-INF/lib/jedis-2.7.2.jar \
 ~/dev/bigbluebutton/bbb-screenshare/app/target/webapp/WEB-INF/lib/commons-pool2-2.3.jar \
 ~/dev/bigbluebutton/bbb-screenshare/app/target/webapp/WEB-INF/lib/spring-webmvc-4.3.12.RELEASE.jar  \
 ~/dev/bigbluebutton/bbb-screenshare/app/target/webapp/WEB-INF/lib/rediscala_2.12-1.8.0.jar  \
 ~/dev/bigbluebutton/bbb-screenshare/app/target/webapp/WEB-INF/lib/bbb-common-message_2.12-0.0.19-SNAPSHOT.jar \
  /usr/share/red5/webapps/screenshare/WEB-INF/lib/


#sudo mkdir /usr/share/red5/webapps/screenshare/WEB-INF/classes
#cd /usr/share/red5/webapps/screenshare/WEB-INF/classes/
#sudo jar -xf ../lib/bbb-screenshare-akka_2.12-0.0.2.jar
#sudo rm /usr/share/red5/webapps/screenshare/WEB-INF/lib/bbb-screenshare-akka_2.12-0.0.2.jar

cd /usr/share/red5/webapps/screenshare
sudo mkdir lib
cd lib
sudo cp -r ~/dev/bigbluebutton/bbb-screenshare/app/jws/lib/* .
cd ..
sudo cp ~/dev/bigbluebutton/bbb-screenshare/app/jws/screenshare.jnlp .
sudo cp ~/dev/bigbluebutton/bbb-screenshare/app/jws/screenshare.jnlp.h264 .

sudo chmod -R 777 /usr/share/red5/webapps/screenshare
sudo chown -R red5:red5 /usr/share/red5/webapps/screenshare

# TODO change the owner username to 'firstuser'

# // Dev only
#sudo service red5 restart
#sudo service tomcat7 restart
#sudo service bbb-apps-akka restart

