/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
* 
* Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
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
* Author: Felipe Cecagno <felipe@mconf.org>
*/
package org.bigbluebutton.conference.service.layout;

import java.util.Map;

import org.bigbluebutton.conference.BigBlueButtonSession;
import org.bigbluebutton.conference.Constants;
import org.red5.logging.Red5LoggerFactory;
import org.red5.server.api.Red5;
import org.slf4j.Logger;

public class LayoutService {
	
	private static Logger log = Red5LoggerFactory.getLogger( LayoutService.class, "bigbluebutton" );
	
	private LayoutApplication application;

	public void getCurrentLayout() {
		String meetingID = Red5.getConnectionLocal().getScope().getName();
		application.getCurrentLayout(meetingID, getBbbSession().getInternalUserID());
	}
	
	public void lock(Map<String, Object> message) {
		String meetingID = Red5.getConnectionLocal().getScope().getName();
		application.lockLayout(meetingID, (String) message.get("setByUserID"), (String) message.get("layout"));
	}
	
	public void unlock() {
		String meetingID = Red5.getConnectionLocal().getScope().getName();
		application.unlockLayout(meetingID);
	}
	
	public void setLayoutApplication(LayoutApplication a) {
		log.debug("Setting layout application");
		application = a;
	}
	
	private BigBlueButtonSession getBbbSession() {
		return (BigBlueButtonSession) Red5.getConnectionLocal().getAttribute(Constants.SESSION);
	}
}
