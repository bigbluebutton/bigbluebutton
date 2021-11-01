#!/bin/bash -e

#
# Restart nginx to take advantage of the updates to /etc/bigbluebutton/nginx
#


DEPLOY_DIR=/var/lib/$TOMCAT_SERVICE/webapps

rm -rf /tmp/demo
unzip /var/tmp/demo.war -d /tmp/demo > /dev/null

if [ -f $DEPLOY_DIR/demo/bbb_api_conf.jsp ]; then
	cp ${DEPLOY_DIR}/demo/bbb_api_conf.jsp /tmp/demo
else
	if [ -f $SERVLET_DIR/WEB-INF/classes/bigbluebutton.properties ]; then
    if grep -q securitySalt $SERVLET_DIR/WEB-INF/classes/bigbluebutton.properties; then
      SALT=$(cat $SERVLET_DIR/WEB-INF/classes/bigbluebutton.properties | tr -d '\r' | sed -n '/securitySalt/{s/.*=//;p}')
			HOST=$(cat $SERVLET_DIR/WEB-INF/classes/bigbluebutton.properties | sed -n '/^bigbluebutton.web.serverURL/{s/.*\///;p}')
			echo -n "<%" > /tmp/demo/bbb_api_conf.jsp
			echo "!
// This is the security salt that must match the value set in the BigBlueButton server
String salt = \"$SALT\";

// This is the URL for the BigBlueButton server
String BigBlueButtonURL = \"http://$HOST/bigbluebutton/\";
%>
" >> /tmp/demo/bbb_api_conf.jsp
    fi
	else
		echo "#"
		echo "# Warning: Unable to set shared secret (salt) and URL for API demos."
		echo "#"
  fi
fi

cd /tmp/demo
zip -r demo * > /dev/null
mv -f demo.zip $DEPLOY_DIR/demo.war
touch $DEPLOY_DIR/demo.war

mkdir -p /var/www/bigbluebutton/client/images
cp /tmp/demo/images/headset* /var/www/bigbluebutton/client/images
cp /tmp/demo/demo11.html /var/www/bigbluebutton/client

reloadService nginx

