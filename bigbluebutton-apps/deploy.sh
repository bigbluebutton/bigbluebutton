#!/bin/bash
# deploying 'bigbluebutton-apps' to /usr/share/red5/webapps

sudo chown -R red5.red5 /usr/share/red5/webapps

gradle clean
gradle resolveDeps
gradle war deploy

sudo chown -R red5.red5 /usr/share/red5/webapps

# Remove slf4j jar as it conflicts with logging with red5
FILE=/usr/share/red5/webapps/bigbluebutton/WEB-INF/lib/slf4j-api-1.7.23.jar
if [ -f $FILE ] 
then
 sudo rm $FILE
fi

