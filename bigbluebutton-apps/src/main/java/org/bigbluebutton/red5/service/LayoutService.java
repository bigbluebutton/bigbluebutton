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
package org.bigbluebutton.red5.service;

import java.util.Map;

import org.bigbluebutton.red5.BigBlueButtonSession;
import org.bigbluebutton.red5.Constants;
import org.bigbluebutton.red5.pubsub.MessagePublisher;
import org.red5.logging.Red5LoggerFactory;
import org.red5.server.api.Red5;
import org.slf4j.Logger;

public class LayoutService {
	
	private static Logger log = Red5LoggerFactory.getLogger( LayoutService.class, "bigbluebutton" );
	
	private MessagePublisher red5GW;
	
	public void setRed5Publisher(MessagePublisher inGW) {
		red5GW = inGW;
	}

	public void getCurrentLayout() {
		String meetingID = Red5.getConnectionLocal().getScope().getName();

		red5GW.getCurrentLayout(meetingID, getBbbSession().getInternalUserID());
	}
		
	public void broadcast(Map<String, Object> message) {
		log.debug("Received broadcast layout request");
		String meetingID = Red5.getConnectionLocal().getScope().getName();
		String newlayout = (String) message.get("layout");

		if (newlayout == null || newlayout.isEmpty()) {
			log.error("Invalid Broadcast Layout message. layout is null or empty.");
			return;
		}
							
		red5GW.broadcastLayout(meetingID, getBbbSession().getInternalUserID(), newlayout);
	}
	
	public void lock(Map<String, Object> message) {
		log.debug("Received lock layout request");
		String meetingID = Red5.getConnectionLocal().getScope().getName();
		String newlayout = (String) message.get("layout");
		Boolean lock = (Boolean) message.get("lock");
		Boolean viewersOnly = (Boolean) message.get("viewersOnly");
		String layout;
		
		if  (newlayout == null || newlayout.isEmpty()) {
			layout = null;
		} else {
			layout = newlayout;
		}
		
		if (lock == null) {
			log.error("Invalid Lock Layout message. lock in null.");
			return;
		}
		
		if (viewersOnly == null) {
			log.error("Invalid Lock Layout message. viewersOnly is null");
			return;
		}
		
		red5GW.lockLayout(meetingID, getBbbSession().getInternalUserID(), lock, viewersOnly, layout); 
	}
	
	private BigBlueButtonSession getBbbSession() {
		return (BigBlueButtonSession) Red5.getConnectionLocal().getAttribute(Constants.SESSION);
	}
}
