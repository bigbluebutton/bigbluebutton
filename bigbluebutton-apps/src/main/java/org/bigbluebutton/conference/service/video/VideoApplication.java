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
package org.bigbluebutton.conference.service.video;

import org.bigbluebutton.conference.BigBlueButtonSession;
import org.bigbluebutton.conference.Constants;
import org.bigbluebutton.core.api.IBigBlueButtonInGW;
import org.red5.logging.Red5LoggerFactory;
import org.red5.server.api.Red5;
import org.slf4j.Logger;

public class VideoApplication {

	private static Logger log = Red5LoggerFactory.getLogger(VideoService.class, "bigbluebutton");

	private IBigBlueButtonInGW bbbInGW;
	private String defaultStreampath;

	public void getStreamPath(String streamName) {
		String meetingId = getBbbSession().getRoom();
		String userId = getBbbSession().getInternalUserID();
		bbbInGW.getStreamPath(meetingId, userId, streamName, defaultStreampath);
	}

	private BigBlueButtonSession getBbbSession() {
		return (BigBlueButtonSession) Red5.getConnectionLocal().getAttribute(Constants.SESSION);
	}

	public void setBigBlueButtonInGW(IBigBlueButtonInGW inGW) {
		bbbInGW = inGW;
	}

	public void setDefaultStreamPath(String path) {
		this.defaultStreampath = path;
	}
}
