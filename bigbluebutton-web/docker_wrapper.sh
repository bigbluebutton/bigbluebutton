#!/bin/bash -e

pushd .
cd webapps/
jar xvf bigbluebutton.war
sed -i 's|^bigbluebutton\.web\.serverURL.*|bigbluebutton.web.serverURL=https://$SERVER_URL|g' bigbluebutton/WEB-INF/classes/bigbluebutton.properties
popd

./bin/catalina.sh run

