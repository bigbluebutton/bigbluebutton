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
*
*/
package org.bigbluebutton.red5.service;

import java.util.Map;

import org.bigbluebutton.red5.BigBlueButtonSession;
import org.bigbluebutton.red5.Constants;
import org.bigbluebutton.red5.pubsub.MessagePublisher;
import org.red5.logging.Red5LoggerFactory;
import org.red5.server.api.Red5;
import org.slf4j.Logger;

public class CaptionService {	
	private static Logger log = Red5LoggerFactory.getLogger( CaptionService.class, "bigbluebutton" );
	
	private MessagePublisher red5InGW;

	public void setRed5Publisher(MessagePublisher inGW) {
		red5InGW = inGW;
	}
	
	private BigBlueButtonSession getBbbSession() {
		return (BigBlueButtonSession) Red5.getConnectionLocal().getAttribute(Constants.SESSION);
	}
	
	public void getCaptionHistory() {
		String meetingID = Red5.getConnectionLocal().getScope().getName();
		String requesterID = getBbbSession().getInternalUserID();
		
		red5InGW.sendCaptionHistory(meetingID, requesterID);
	}
	
	public void sendUpdateCaptionOwner(Map<String, Object> msg) {
		String locale = msg.get("locale").toString();
		String localeCode = msg.get("localeCode").toString();
		Boolean claim = (Boolean) msg.get("claim");
		
		String meetingID = Red5.getConnectionLocal().getScope().getName();
		String ownerID = (claim ? getBbbSession().getInternalUserID() : "");
		
		red5InGW.updateCaptionOwner(meetingID, locale, localeCode, ownerID);
	}
	
	public void editCaptionHistory(Map<String, Object> msg) {
		String locale = msg.get("locale").toString();
		String localeCode = msg.get("localeCode").toString();
		String text = msg.get("text").toString();
		
		String meetingID = Red5.getConnectionLocal().getScope().getName();
		String userID = getBbbSession().getInternalUserID();

		Integer startIndex;
		if (msg.get("startIndex") instanceof Double) {
			Double tempStartIndex = (Double) msg.get("startIndex");
			startIndex = tempStartIndex.intValue();
		} else {
			startIndex = (Integer) msg.get("startIndex");
		}

		Integer endIndex;
		if (msg.get("endIndex") instanceof Double) {
			Double tempEndIndex = (Double) msg.get("endIndex");
			endIndex = tempEndIndex.intValue();
		} else {
			endIndex = (Integer) msg.get("endIndex");
		}

		red5InGW.editCaptionHistory(meetingID, userID, startIndex, endIndex, locale, localeCode, text);
	}
}
