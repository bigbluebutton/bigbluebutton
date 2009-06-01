#!/bin/sh

#
# BigBlueButton: Script to build/deploy the BigBlueButton web application


if dpkg-query -s bbb-web | grep installed > /dev/null 2>&1; then
        sudo apt-get remove --force-yes bbb-web
fi

BUILD=1

while [ $# -gt 0 ]; do    # Until you run out of parameters . . .
  case "$1" in
    -d|--drop)
              # drop the database
		DROP=1
              ;;
  esac
  shift       # Check next set of parameters.
done



ant war

if [ $? -ne 0 ]; then
	exit 1
fi


sudo /etc/init.d/tomcat6 stop

echo "Removing old bigbluebutton.war"
sudo rm -f /var/lib/tomcat6/webapps/bigbluebutton.war
sudo rm -rf /var/lib/tomcat6/webapps/bigbluebutton

if [ $DROP ]; then 
	mysqladmin -u root --force drop bigbluebutton_dev
	mysqladmin -u root create bigbluebutton_dev	
fi

echo "Deploying new version of bigbluebutton.war"
sudo cp bigbluebutton-0.1.war /var/lib/tomcat6/webapps/bigbluebutton.war

sudo /etc/init.d/tomcat6 start	

echo -n "Deploying new version "
while [ ! -d /var/lib/tomcat6/webapps/bigbluebutton ]; do
	echo -n "."
	sleep 1
done

echo " done"
echo
