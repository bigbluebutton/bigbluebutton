#!/bin/bash

BBB_URL=$(grep -s '^BBB_URL=' /etc/bigbluebutton/bigbluebutton.env | tail -n 1 | cut -d= -f2-)
BBB_SECRET=$(grep -s '^BBB_SECRET=' /etc/bigbluebutton/bigbluebutton.env | tail -n 1 | cut -d= -f2-)
SECRET=${BBB_SECRET:-$(grep sharedSecret /etc/bigbluebutton/bbb-apps-akka.conf | sed 's/^.*=//')}
URL=${BBB_URL:-$(grep bigbluebutton.web.serverURL= /etc/bigbluebutton/bbb-web.properties | sed 's/^.*=//')}

echo BBB_URL="$URL/bigbluebutton/api"
echo BBB_SECRET=$SECRET
