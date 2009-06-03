#!/bin/sh

#
# BigBlueButton: Script to build/deploy the BigBlueButton applications on red5

while [ $# -gt 0 ]; do    # Until you run out of parameters . . .
  case "$1" in
    -h|--help)
              # drop the database
                echo "
Helper script to build and deploy the BigBlueButton web apps.

Hint: To avoid entering your password with sudo, just type 

	sudo ls
	
at the start of your development session to have sudo remember that you can become
root.
"
		exit 0
              ;;
  esac
  shift       # Check next set of parameters.
done


#
# Remove the bbb-apps package if its already installed
if dpkg-query -s bbb-apps | grep "install ok installed" > /dev/null 2>&1; then
        sudo apt-get purge --yes bbb-apps
fi

#
# Quick check if ant resolve has been run.
#
# Note if you are referencing any additional .jar files, you should run 
# ant resolve manually
if [ ! -f ./lib/activemq-core-5.1.0.jar ]; then
	ant resolve
fi

#
# Compile the BigBlueButton apps
ant dist
if [ $? -ne 0 ]; then
	exit 1
fi

#
# Looks like we're good to deploy
sudo /etc/init.d/red5 stop

echo 
echo "Removing old red5/webapps/bigbluebutton"
sudo rm -rf /usr/share/red5/webapps/bigbluebutton

echo
echo "Deploying new version of red5/webapps/bigbluebutton"
sudo cp -r ./dist/webapps/bigbluebutton /usr/share/red5/webapps

sudo /etc/init.d/red5 start	

echo "done"
echo
