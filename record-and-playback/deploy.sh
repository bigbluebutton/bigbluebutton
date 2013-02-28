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

sudo cp core/Gemfile /usr/local/bigbluebutton/core/Gemfile
sudo rm -rf /usr/local/bigbluebutton/core/lib
sudo cp -r core/lib /usr/local/bigbluebutton/core/
sudo rm -rf /usr/local/bigbluebutton/core/scripts
sudo cp -r core/scripts /usr/local/bigbluebutton/core/
sudo rm -rf /etc/bigbluebutton/god
sudo cp -r core/god/god /etc/bigbluebutton/
sudo rm -f /etc/init.d/bbb-record-core
sudo cp core/god/initd.god /etc/init.d/bbb-record-core
sudo chmod 0755 /etc/init.d/bbb-record-core
sudo rm -rf /var/bigbluebutton/playback/*

function deploy_format() {
    local formats=$1
    for format in $formats
    do
        playback_dir="$format/playback/$format"
        scripts_dir="$format/scripts"
        if [ -d $playback_dir ]; then sudo cp -r $playback_dir /var/bigbluebutton/playback/; fi
        if [ -d $scripts_dir ]; then sudo cp -r $scripts_dir/* /usr/local/bigbluebutton/core/scripts/; fi
        sudo mkdir -p /var/log/bigbluebutton/$format
    done
}

RECORDING_SERVER=false
if $RECORDING_SERVER ; then
    sudo cp mconf/scripts/mconf-god-conf.rb /etc/bigbluebutton/god/conf/
    sudo cp mconf/scripts/mconf-decrypt.rb /usr/local/bigbluebutton/core/scripts/
    deploy_format "presentation"
else
    deploy_format "mconf"
fi

sudo mkdir -p /var/bigbluebutton/playback/
sudo mkdir -p /var/bigbluebutton/recording/raw/
sudo mkdir -p /var/bigbluebutton/recording/process/
sudo mkdir -p /var/bigbluebutton/recording/publish/
sudo mkdir -p /var/bigbluebutton/recording/status/recorded/
sudo mkdir -p /var/bigbluebutton/recording/status/archived/
sudo mkdir -p /var/bigbluebutton/recording/status/processed/
sudo mkdir -p /var/bigbluebutton/recording/status/sanity/

sudo mv /usr/local/bigbluebutton/core/scripts/*.nginx /etc/bigbluebutton/nginx/
sudo chown -R tomcat6:tomcat6 /var/bigbluebutton/ /var/log/bigbluebutton/

cd /usr/local/bigbluebutton/core/
sudo bundle install
