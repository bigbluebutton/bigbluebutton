#!/bin/sh -e

# bbb-apps-akka.conf
TARGET=/etc/bigbluebutton/bbb-apps-akka.conf
cp /etc/bigbluebutton/bbb-apps-akka.conf.tmpl $TARGET
sed -i "s/DOMAIN/$DOMAIN/" $TARGET
sed -i "s/SHARED_SECRET/$SHARED_SECRET/" $TARGET
sed -i "s/POSTGRES_PASSWORD/$POSTGRES_PASSWORD/" $TARGET

cd /bbb-apps-akka
/bbb-apps-akka/bin/bbb-apps-akka
