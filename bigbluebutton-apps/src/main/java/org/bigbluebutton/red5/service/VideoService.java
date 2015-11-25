/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2014 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 3.0 of the License, or (at your option) any later
* version.
*
* BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
*
*/
package org.bigbluebutton.red5.service;

import java.util.Map;

import org.slf4j.Logger;
import org.red5.logging.Red5LoggerFactory;

public class VideoService {

	private static Logger log = Red5LoggerFactory.getLogger(VideoService.class, "bigbluebutton");

	private VideoApplication videoApplication;

//	public void getStreamPath(String streamName) {
//		log.debug("Stream Path requested for [{}]", streamName);
//		videoApplication.getStreamPath(streamName);
//	}

	public void setVideoApplication(VideoApplication a) {
		log.debug("Setting video application");
		this.videoApplication = a;
	}
}