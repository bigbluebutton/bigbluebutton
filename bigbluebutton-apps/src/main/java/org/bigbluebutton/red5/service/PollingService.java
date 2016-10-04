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

public class PollingService {
	
	private static Logger log = Red5LoggerFactory.getLogger( PollingService.class, "bigbluebutton" );
	
	private MessagePublisher red5GW;
	
	public void setRed5Publisher(MessagePublisher inGW) {
		red5GW = inGW;
	}

	public void votePoll(Map<String, Object> message) {
		String meetingID = Red5.getConnectionLocal().getScope().getName();
		String userId = getBbbSession().getInternalUserID();
		String pollId = (String) message.get("pollId");

		Integer questionId;
		if (message.get("answerId") instanceof Double) {
			Double tempQuestionId = (Double) message.get("answerId");
			questionId = tempQuestionId.intValue();
		} else {
			questionId = (Integer) message.get("answerId");
		}

		Integer answerId;
		if (message.get("answerId") instanceof Double) {
			Double tempAnswerId = (Double) message.get("answerId");
			answerId = tempAnswerId.intValue();
		} else {
			answerId = (Integer) message.get("answerId");
		}

		red5GW.votePoll(meetingID, userId, pollId, questionId, answerId);
	}
	
	public void showPollResult(Map<String, Object> message) {
		String meetingID = Red5.getConnectionLocal().getScope().getName();
		String userId = getBbbSession().getInternalUserID();
		String pollId = (String) message.get("pollId");
		Boolean show = (Boolean) message.get("show");
				
		red5GW.showPollResult(meetingID, userId, pollId, show);
	}
	
	public void sendPollingMessage(String json) {
		String meetingID = Red5.getConnectionLocal().getScope().getName();
		String userId = getBbbSession().getInternalUserID();
							
		red5GW.sendPollingMessage(json);
	}
	
	public void startPoll(Map<String, Object> message) {
		String meetingID = Red5.getConnectionLocal().getScope().getName();
		String userId = getBbbSession().getInternalUserID();
		String pollId = (String) message.get("pollId");
		String pollType = (String) message.get("pollType");
							
		red5GW.startPoll(meetingID, userId, pollId, pollType);
	}
	
	public void stopPoll(Map<String, Object> message) {
		String meetingID = Red5.getConnectionLocal().getScope().getName();
		String userId = getBbbSession().getInternalUserID();
		String pollId = (String) message.get("pollId");
		
		red5GW.stopPoll(meetingID, userId, pollId); 
	}
	
	private BigBlueButtonSession getBbbSession() {
		return (BigBlueButtonSession) Red5.getConnectionLocal().getAttribute(Constants.SESSION);
	}
}
