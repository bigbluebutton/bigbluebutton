#!/bin/bash -xe

mkdir -p /var/bigbluebutton/recording/raw
mkdir -p /var/bigbluebutton/recording/process
mkdir -p /var/bigbluebutton/recording/publish
mkdir -p /var/bigbluebutton/recording/status/recorded
mkdir -p /var/bigbluebutton/recording/status/archived
mkdir -p /var/bigbluebutton/recording/status/processed
mkdir -p /var/bigbluebutton/recording/status/sanity
mkdir -p /var/bigbluebutton/published
mkdir -p /var/bigbluebutton/deleted
mkdir -p /var/bigbluebutton/unpublished

sed -i 's/redisHost=.*/redisHost=redis/g' /bbb-web/WEB-INF/classes/bigbluebutton.properties
sed -i "s/bigbluebutton.web.serverURL=.*/bigbluebutton.web.serverURL=https:\/\/$SERVER_DOMAIN/g" /bbb-web/WEB-INF/classes/bigbluebutton.properties

sed -i "s/securitySalt=.*/securitySalt=$SHARED_SECRET/g" /bbb-web/WEB-INF/classes/bigbluebutton.properties

sed -i 's/^attendeesJoinViaHTML5Client=.*/attendeesJoinViaHTML5Client=true/'   /bbb-web/WEB-INF/classes/bigbluebutton.properties

sed -i 's/^moderatorsJoinViaHTML5Client=.*/moderatorsJoinViaHTML5Client=true/' /bbb-web/WEB-INF/classes/bigbluebutton.properties

sed -n 's/swfSlidesRequired=true/swfSlidesRequired=false/g'                    /bbb-web/WEB-INF/classes/bigbluebutton.properties

exec "$@"