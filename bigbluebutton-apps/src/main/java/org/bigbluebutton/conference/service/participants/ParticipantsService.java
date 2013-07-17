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

package org.bigbluebutton.conference.service.participants;

import org.slf4j.Logger;
import org.red5.logging.Red5LoggerFactory;
import org.red5.server.api.Red5;
import org.red5.server.api.scope.IScope;
import java.util.Map;
import org.bigbluebutton.conference.BigBlueButtonSession;
import org.bigbluebutton.conference.Constants;


public class ParticipantsService {

	private static Logger log = Red5LoggerFactory.getLogger( ParticipantsService.class, "bigbluebutton" );	
	private ParticipantsApplication application;

	public void assignPresenter(Map<String, String> msg) {

		IScope scope = Red5.getConnectionLocal().getScope();
		log.debug("Checking assignPresenter values " + msg.get("newPresenterID") + " " + msg.get("newPresenterName") + " " + msg.get("assignedBy"));
		application.assignPresenter(scope.getName(), (String) msg.get("newPresenterID"), (String) msg.get("newPresenterName"), (String) msg.get("assignedBy"));
	}
	
	public void getParticipants() {
		IScope scope = Red5.getConnectionLocal().getScope();
		application.getUsers(scope.getName(), getBbbSession().getInternalUserID());
	}
	
		
	public void setParticipantStatus(Map<String, Object> msg) {
		String roomName = Red5.getConnectionLocal().getScope().getName();

		application.setParticipantStatus(roomName, (String) msg.get("userID"), (String) msg.get("status"), (Object) msg.get("value"));
	}
	
	public void setParticipantsApplication(ParticipantsApplication a) {
		log.debug("Setting Participants Applications");
		application = a;
	}
	
	private BigBlueButtonSession getBbbSession() {
		return (BigBlueButtonSession) Red5.getConnectionLocal().getAttribute(Constants.SESSION);
	}
}
