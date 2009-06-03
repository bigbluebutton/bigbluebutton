#!/bin/sh

#
# BigBlueButton: Script to build/deploy the BigBlueButton client


while [ $# -gt 0 ]; do    # Until you run out of parameters . . .
  case "$1" in
    -h|--help)
                echo "
Helper script to build and deploy the BigBlueButton client.

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
# Remove the bbb-client package if its already installed
if dpkg-query -s bbb-client | grep "install ok installed" > /dev/null 2>&1; then
        sudo apt-get purge --yes bbb-client
fi


#
# Assign the local IP address
#

ant cleanandmake

if [ $? -ne 0 ]; then
	exit 1
fi


#
# Copy over new client
#

sudo rm -rf /var/www/bigbluebutton
sudo mkdir /var/www/bigbluebutton
sudo cp -r ./client /var/www/bigbluebutton

#
# Adjust the IP for the config.xml to match local machine
#

OLD_IP="$(cat /var/www/bigbluebutton/client/conf/config.xml | sed 's/"//g' | sed -n '/<porttest /{s/.*host=//;s/ .*//;p}')"
IP="$(ifconfig eth0 | sed -n '/inet /{s/.*addr://;s/ .*//;p}')"
sudo sed -i "s/$OLD_IP/$IP/g" /var/www/bigbluebutton/client/conf/config.xml

echo "New client installed in /var/www/bigbluebutton."
echo "done"
