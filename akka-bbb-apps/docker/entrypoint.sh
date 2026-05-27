#!/bin/sh -e

# bbb-apps-akka.conf
TARGET=/etc/bigbluebutton/bbb-apps-akka.conf
cp /etc/bigbluebutton/bbb-apps-akka.conf.tmpl $TARGET
sed -i "s/SHARED_SECRET/$SHARED_SECRET/" $TARGET
sed -i "s/POSTGRES_PASSWORD/$POSTGRES_PASSWORD/" $TARGET

# Set log level
sed -i "s|BBB_APPS_AKKA_LOGLEVEL|${BBB_APPS_AKKA_LOGLEVEL:-INFO}|g" /bbb-apps-akka/conf/logback.xml

yq e -i  ".public.pads.url = \"https://$BBB_SERVER_URL/pad\"" /usr/share/bigbluebutton/html5-client/private/config/settings.yml
sed -i "s|#url: wss://LIVEKIT_HOST/livekit|url: wss://$BBB_SERVER_URL/livekit/|" /usr/share/bigbluebutton/html5-client/private/config/settings.yml

cd /bbb-apps-akka
/bbb-apps-akka/bin/bbb-apps-akka
