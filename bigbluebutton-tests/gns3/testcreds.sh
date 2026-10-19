#!/bin/bash

if [ -r /etc/bigbluebutton/bigbluebutton.env ]; then source /etc/bigbluebutton/bigbluebutton.env; fi
SECRET=${BBB_SECRET:-$(grep sharedSecret /etc/bigbluebutton/bbb-apps-akka.conf | sed 's/^.*=//')}
URL=${BBB_URL:-$(grep bigbluebutton.web.serverURL= /etc/bigbluebutton/bbb-web.properties | sed 's/^.*=//')}

echo BBB_URL="$URL/bigbluebutton/api"
echo BBB_SECRET=$SECRET
