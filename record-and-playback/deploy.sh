#!/bin/bash

#
# BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
#
# Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
#
# This program is free software; you can redistribute it and/or modify it under the
# terms of the GNU Lesser General Public License as published by the Free Software
# Foundation; either version 3.0 of the License, or (at your option) any later
# version.
#
# BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
# WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
# PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
#
# You should have received a copy of the GNU Lesser General Public License along
# with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
#
# Authors:
#   Felipe Cecagno (felipe@mconf.org)
#

echo
echo "+++++ Building record-and-playback"
cd ~/dev/bigbluebutton/record-and-playback/

sudo rm -f /usr/local/bigbluebutton/core/scripts/*.rb
sudo rm -f /usr/local/bigbluebutton/core/scripts/process/*.rb
sudo rm -f /usr/local/bigbluebutton/core/scripts/publish/*.rb
#sudo rm -f /usr/local/bigbluebutton/core/scripts/*.yml
sudo rm -f /usr/local/bigbluebutton/core/scripts/*.nginx

sudo cp -r core/god/* /etc/bigbluebutton/
sudo cp -r core/lib/* /usr/local/bigbluebutton/core/lib/
sudo cp -r core/scripts/* /usr/local/bigbluebutton/core/scripts/

if [ $# -eq 0 ]; then
    PLAYBACK_LIST="slides presentation"

    # Mconf specific files
    sudo cp mconf/scripts/mconf-god-conf.rb /etc/bigbluebutton/god/conf/
    sudo cp mconf/scripts/mconf-decrypt.rb /usr/local/bigbluebutton/core/scripts/
else
    PLAYBACK_LIST="$1"
fi

sudo mkdir -p /var/bigbluebutton/playback/
sudo mkdir -p /var/bigbluebutton/recording/raw/
sudo mkdir -p /var/bigbluebutton/recording/process/
sudo mkdir -p /var/bigbluebutton/recording/publish/
sudo mkdir -p /var/bigbluebutton/recording/status/recorded/
sudo mkdir -p /var/bigbluebutton/recording/status/archived/
sudo mkdir -p /var/bigbluebutton/recording/status/processed/
sudo mkdir -p /var/bigbluebutton/recording/status/sanity/

for PLAYBACK in $PLAYBACK_LIST
do
  if [ -d $PLAYBACK/playback ]; then sudo cp -r $PLAYBACK/playback/* /var/bigbluebutton/playback/; fi
  if [ -d $PLAYBACK/scripts ]; then sudo cp -r $PLAYBACK/scripts/* /usr/local/bigbluebutton/core/scripts/; fi
  sudo cp -f $PLAYBACK/scripts/*-god-conf.rb /etc/bigbluebutton/god/conf/
  sudo mkdir -p /var/log/bigbluebutton/$PLAYBACK
done
sudo chown -R tomcat6:tomcat6 /var/bigbluebutton/ /var/log/bigbluebutton/
sudo cp -f /usr/local/bigbluebutton/core/scripts/*.nginx /etc/bigbluebutton/nginx/

