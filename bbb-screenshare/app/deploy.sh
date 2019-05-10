#!/bin/bash
# deploying 'screenshare' to /usr/share/red5/webapps

sbt clean compile package

if [[ -d /usr/share/red5/webapps/screenshare ]]; then
    sudo rm -r /usr/share/red5/webapps/screenshare
fi
sudo cp -r target/webapp/ /usr/share/red5/webapps/screenshare

sudo rm -rf /usr/share/red5/webapps/screenshare/WEB-INF/lib/*
sudo cp target/webapp/WEB-INF/lib/bbb-screenshare-akka_2.12-0.0.3.jar \
 target/webapp/WEB-INF/lib/scala-library-2.12.8.jar \
 target/webapp/WEB-INF/lib/scala-reflect-2.12.8.jar \
 target/webapp/WEB-INF/lib/jackson-* \
 target/webapp/WEB-INF/lib/paranamer-2.8.jar \
 target/webapp/WEB-INF/lib/akka-* \
 target/webapp/WEB-INF/lib/config-1.3.3.jar \
 target/webapp/WEB-INF/lib/gson-2.8.5.jar \
 target/webapp/WEB-INF/lib/commons-pool2-2.6.0.jar \
 target/webapp/WEB-INF/lib/spring-webmvc-4.3.12.RELEASE.jar  \
  target/webapp/WEB-INF/lib/bbb-common-message_2.12-0.0.20-SNAPSHOT.jar \
 target/webapp/WEB-INF/lib/lettuce-core-5.1.3.RELEASE.jar \
 target/webapp/WEB-INF/lib/netty-* \
 target/webapp/WEB-INF/lib/reactor-core-3.2.3.RELEASE.jar \
 target/webapp/WEB-INF/lib/reactive-streams-1.0.2.jar \
  /usr/share/red5/webapps/screenshare/WEB-INF/lib/

#sudo mkdir /usr/share/red5/webapps/screenshare/WEB-INF/classes
#cd /usr/share/red5/webapps/screenshare/WEB-INF/classes/
#sudo jar -xf .lib/bbb-screenshare-akka_2.12-0.0.3.jar
#sudo rm /usr/share/red5/webapps/screenshare/WEB-INF/lib/bbb-screenshare-akka_2.12-0.0.3.jar

sudo mkdir -p /usr/share/red5/webapps/screenshare/lib
sudo cp -r jws/lib/* /usr/share/red5/webapps/screenshare/lib
sudo cp jws/screenshare.jnlp /usr/share/red5/webapps/screenshare
sudo cp jws/screenshare.jnlp.h264 /usr/share/red5/webapps/screenshare

sudo chmod -R 777 /usr/share/red5/webapps/screenshare
sudo chown -R red5:red5 /usr/share/red5/webapps/screenshare

# // Dev only
#sudo service red5 restart
#sudo service tomcat7 restart
#sudo service bbb-web restart
#sudo service bbb-apps-akka restart
