#!/bin/sh

#
# BigBlueButton: Script to build/deploy the BigBlueButton client

if dpkg-query -s bbb-client | grep installed > /dev/null 2>&1; then
	sudo apt-get remove --force-yes bbb-client
fi

ant cleanandmake

if [ $? -ne 0 ]; then
	exit 1
fi

#
# Assign the local IP address
#
OLD_IP="$(cat ./client/conf/config.xml | sed 's/"//g' | sed -n '/<porttest /{s/.*host=//;s/ .*//;p}')"
IP="$(ifconfig eth0 | sed -n '/inet /{s/.*addr://;s/ .*//;p}')"

sed -i "s/$OLD_IP/$IP/g" ./client/conf/config.xml

while [ $# -gt 0 ]; do    # Until you run out of parameters . . .
  case "$1" in
    -d|--drop)
              # drop the database
		DROP=1
              ;;
    -n)
		# don't rebuild the war
		echo "set"
              BUILD=0
              ;;
  esac
  shift       # Check next set of parameters.
done


#
# Copy over new client
#

sudo rm -rf /var/www/bigbluebutton
sudo mkdir /var/www/bigbluebutton
sudo cp -r ./client /var/www/bigbluebutton

echo "New client installed in /var/www/bigbluebutton."
