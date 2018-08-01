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

export JAVA_OPTS="${JAVA_OPTS} -Djava.security.egd=file:/dev/./urandom -DsecuritySalt=${SHARED_SECRET} -Dredis.host=redis -DredisHost=redis -Dbigbluebutton.web.serverURL=https://${SERVER_DOMAIN} -DattendeesJoinViaHTML5Client=true -DmoderatorsJoinViaHTML5Client=true -DsvgImagesRequired=true"
sed -i "s|^securerandom\.source=.*|securerandom.source=file:/dev/urandom|g" ${JAVA_HOME}/lib/security/java.security

catalina.sh run
