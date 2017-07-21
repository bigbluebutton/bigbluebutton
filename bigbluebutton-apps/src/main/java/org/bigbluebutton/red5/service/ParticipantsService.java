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

import org.red5.server.api.Red5;
import org.red5.server.api.scope.IScope;
import java.util.Map;
import org.bigbluebutton.red5.BigBlueButtonSession;
import org.bigbluebutton.red5.Constants;
import org.bigbluebutton.red5.pubsub.MessagePublisher;

public class ParticipantsService {

	private MessagePublisher red5InGW;
	
	public void activityResponse() {
		IScope scope = Red5.getConnectionLocal().getScope();
		String meetingId = scope.getName();
		red5InGW.activityResponse(meetingId);
	}
	
	public void setRecordingStatus(Map<String, Object> msg) {
		IScope scope = Red5.getConnectionLocal().getScope();
		String meetingId = scope.getName();
		String userId = (String) msg.get("userId");
		Boolean recording = (Boolean) msg.get("recording");

		red5InGW.setRecordingStatus(meetingId, userId, recording);
	}

	public void getRecordingStatus() {
		IScope scope = Red5.getConnectionLocal().getScope();
		String meetingId = scope.getName();

		red5InGW.getRecordingStatus(meetingId, getMyUserId());
	}
	
	public String getMyUserId() {
		BigBlueButtonSession bbbSession = (BigBlueButtonSession) Red5.getConnectionLocal().getAttribute(Constants.SESSION);
		assert bbbSession != null;
		return bbbSession.getInternalUserID();
	}

	public void setRed5Publisher(MessagePublisher red5InGW) {
		this.red5InGW = red5InGW;
	}
}
