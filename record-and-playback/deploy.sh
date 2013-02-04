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
sudo cp -r core/lib/* /usr/local/bigbluebutton/core/lib/
sudo cp -r core/scripts/* /usr/local/bigbluebutton/core/scripts/

PLAYBACK_LIST="slides presentation"

sudo mkdir -p /var/bigbluebutton/playback/
for PLAYBACK in $PLAYBACK_LIST
do
  sudo cp -r $PLAYBACK/playback/* /var/bigbluebutton/playback/
  sudo cp -r $PLAYBACK/scripts/* /usr/local/bigbluebutton/core/scripts/
done

sudo chown -R tomcat6:tomcat6 /var/bigbluebutton/playback/
sudo cp /usr/local/bigbluebutton/core/scripts/*.nginx /etc/bigbluebutton/nginx/
