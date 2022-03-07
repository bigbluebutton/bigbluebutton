#!/bin/bash -e

DEPLOY_DIR=/var/lib/$TOMCAT_SERVICE/webapps

rm -rf /tmp/demo
unzip /var/tmp/demo.war -d /tmp/demo > /dev/null
cd /tmp/demo
zip -r demo * > /dev/null
mv -f demo.zip $DEPLOY_DIR/demo.war
touch $DEPLOY_DIR/demo.war

# Restart nginx to take advantage of the updates to /etc/bigbluebutton/nginx
reloadService nginx
