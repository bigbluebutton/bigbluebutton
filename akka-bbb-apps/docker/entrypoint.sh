#!/bin/sh -e

# bbb-apps-akka.conf
TARGET=/etc/bigbluebutton/bbb-apps-akka.conf
cp /etc/bigbluebutton/bbb-apps-akka.conf.tmpl $TARGET
sed -i "s/SHARED_SECRET/$SHARED_SECRET/" $TARGET
sed -i "s/POSTGRES_PASSWORD/$POSTGRES_PASSWORD/" $TARGET

# Set log level
sed -i "s|BBB_APPS_AKKA_LOGLEVEL|${BBB_APPS_AKKA_LOGLEVEL:-INFO}|g" /bbb-apps-akka/conf/logback.xml

cd /bbb-apps-akka
/bbb-apps-akka/bin/bbb-apps-akka
