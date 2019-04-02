#!/bin/bash
# deploying 'bigbluebutton-apps' to /usr/share/red5/webapps

sudo chmod -R 777 /usr/share/red5/webapps/*

gradle clean
gradle resolveDeps
gradle war deploy

sudo chown -R red5:red5 /usr/share/red5/webapps
