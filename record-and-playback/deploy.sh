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

set -xe

sudo cp core/Gemfile /usr/local/bigbluebutton/core/Gemfile
sudo rm -rf /usr/local/bigbluebutton/core/lib
sudo cp -r core/lib /usr/local/bigbluebutton/core/
sudo rm -rf /usr/local/bigbluebutton/core/scripts
sudo rm -rf /usr/local/bigbluebutton/core/playback
sudo cp -r core/scripts /usr/local/bigbluebutton/core/
sudo rm -rf /var/bigbluebutton/playback/presentation/0.81/
sudo rm -rf /var/bigbluebutton/playback/presentation/0.9.0/
sudo rm -rf /var/bigbluebutton/playback/presentation/2.0/

function deploy_format() {
	local formats=$1
	for format in $formats
	do
		playback_dir="$format/playback/$format"
		if [ $format == "screenshare" ]; then
			playback_dir="$format/playback"
		fi
		scripts_dir="$format/scripts"
		nginx_file="$format/scripts/*.nginx"
		if [ -d $playback_dir ]; then
			if [ "$format" == "presentation" ]; then sudo cp -r $playback_dir /var/bigbluebutton/playback/; fi
			if [ "$format" == "screenshare" ]; then sudo mkdir -p /usr/local/bigbluebutton/core/playback/$format; sudo cp -r $playback_dir/* /usr/local/bigbluebutton/core/playback/screenshare/; fi
			if ([ "$format" != "presentation" ] & [ "$format" != "screenshare" ]); then sudo mkdir -p /usr/local/bigbluebutton/core/playback/$format; sudo cp -r $playback_dir /usr/local/bigbluebutton/core/playback/; fi
		fi
		if [ -d $scripts_dir ]; then sudo cp -r $scripts_dir/* /usr/local/bigbluebutton/core/scripts/; fi
		if [ -f $nginx_file ]; then sudo cp $scripts_dir/*.nginx /usr/share/bigbluebutton/nginx/; fi
		sudo mkdir -p /var/log/bigbluebutton/$format /var/bigbluebutton/published/$format /var/bigbluebutton/recording/publish/$format
	done
}

deploy_format "presentation"

CAPTIONS_DIR=/var/bigbluebutton/captions/
if [ ! -d "$CAPTIONS_DIR" ]; then
  sudo mkdir -p $CAPTIONS_DIR
fi

EVENTS_DIR=/var/bigbluebutton/events/
if [ ! -d "$EVENTS_DIR" ]; then
  sudo mkdir -p $EVENTS_DIR
fi

PLAYBACK_DIR=/var/bigbluebutton/playback/
if [ ! -d "$PLAYBACK_DIR" ]; then
  sudo mkdir -p $PLAYBACK_DIR
fi

REC_RAW_DIR=/var/bigbluebutton/recording/raw/
if [ ! -d "$REC_RAW_DIR" ]; then
  sudo mkdir -p $REC_RAW_DIR
fi

REC_PROC_DIR=/var/bigbluebutton/recording/process/
if [ ! -d "$REC_PROC_DIR" ]; then
  sudo mkdir -p $REC_PROC_DIR
fi

REC_PUB_DIR=/var/bigbluebutton/recording/publish/
if [ ! -d "$REC_PUB_DIR" ]; then
  sudo mkdir -p $REC_PUB_DIR
fi

REC_STATUS_ENDED_DIR=/var/bigbluebutton/recording/status/ended/
if [ ! -d "$REC_STATUS_ENDED_DIR" ]; then
  sudo mkdir -p $REC_STATUS_ENDED_DIR
fi

REC_STATUS_RECORDED_DIR=/var/bigbluebutton/recording/status/recorded/
if [ ! -d "$REC_STATUS_RECORDED_DIR" ]; then
  sudo mkdir -p $REC_STATUS_RECORDED_DIR
fi

REC_STATUS_ARCHIVED_DIR=/var/bigbluebutton/recording/status/archived/
if [ ! -d "$REC_STATUS_ARCHIVED_DIR" ]; then
  sudo mkdir -p $REC_STATUS_ARCHIVED_DIR
fi

REC_STATUS_PROCESSED_DIR=/var/bigbluebutton/recording/status/processed/
if [ ! -d "$REC_STATUS_PROCESSED_DIR" ]; then
  sudo mkdir -p $REC_STATUS_PROCESSED_DIR
fi

REC_STATUS_SANITY_DIR=/var/bigbluebutton/recording/status/sanity/
if [ ! -d "$REC_STATUS_SANITY_DIR" ]; then
  sudo mkdir -p $REC_STATUS_SANITY_DIR
fi

sudo chown -R bigbluebutton:bigbluebutton /var/bigbluebutton/ /var/log/bigbluebutton/
