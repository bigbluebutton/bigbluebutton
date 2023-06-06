#!/bin/bash

SECRET=$(grep sharedSecret /etc/bigbluebutton/bbb-apps-akka.conf | sed 's/^.*=//')
URL=$(grep bigbluebutton.web.serverURL= /etc/bigbluebutton/bbb-web.properties | sed 's/^.*=//')

echo BBB_URL="$URL/bigbluebutton/api"
echo BBB_SECRET=$SECRET
