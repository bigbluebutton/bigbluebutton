#!/bin/bash

#Clear cached .jar from bbb-common-web, akka-bbb-apps and bigbluebutton-web
scriptDir=$(dirname -- "$(readlink -f -- "$BASH_SOURCE")")
rm -rf $scriptDir/../bbb-common-web/lib_managed/jars/org.bigbluebutton/bbb-common-message_*
rm -rf $scriptDir/../akka-bbb-apps/lib_managed/jars/org.bigbluebutton/bbb-common-message_*
rm -rf $scriptDir/../bigbluebutton-web/lib/bbb-*

#Publish new common-message .jar
sbt clean publish publishLocal
