#!/bin/sh

#
# BigBlueButton: Script to build/deploy the BigBlueButton web application


while [ $# -gt 0 ]; do    # Until you run out of parameters . . .
  case "$1" in
    -h|--help)
                echo "
Helper script to build and deploy the BigBlueButton web apps.

options:
	-h  Print out help text
	-d  Drop database before deploying

Hint: To avoid entering your password with sudo, just type 

	sudo ls
	
at the start of your development session to have sudo remember that you can become
root.
"
		exit 0
              ;;
    -d|--drop)
              # drop the database
		DROP=1
              ;;
  esac
  shift       # Check next set of parameters.
done

#
# Remove the bbb-web package if its already installed
if dpkg-query -s bbb-web | grep "install ok installed" > /dev/null 2>&1; then
        sudo apt-get purge --yes bbb-web
fi

IP="$(ifconfig eth0 | sed -n '/inet /{s/.*addr://;s/ .*//;p}')"

#
# Modify bigbluebutton.properties so it has proper IP address
cp ./grails-app/conf/bigbluebutton.properties .
sed -i "s/bigbluebutton.web.serverURL=http:\/\/.*/bigbluebutton.web.serverURL=http:\/\/$IP/g" ./grails-app/conf/bigbluebutton.properties

ant war

if [ $? -ne 0 ]; then
	mv -f bigbluebutton.properties ./grails-app/conf/bigbluebutton.properties
	exit 1
fi

mv -f bigbluebutton.properties ./grails-app/conf/bigbluebutton.properties

#
# Deploy to the tomcat6 server

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
