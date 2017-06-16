#!/bin/bash
# deploying 'bigbluebutton-apps' to /usr/share/red5/webapps

gradle clean
gradle resolveDeps
gradle war deploy

# Remove slf4j jar as it conflicts with logging with red5
sudo rm /usr/share/red5/webapps/bigbluebutton/WEB-INF/lib/slf4j-api-1.7.23.jar


