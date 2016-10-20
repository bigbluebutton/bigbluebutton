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

public class VoiceService {
	
	private static Logger log = Red5LoggerFactory.getLogger( VoiceService.class, "bigbluebutton" );
	
	private MessagePublisher red5InGW;
		
	public void muteAllUsersExceptPresenter(Map<String, Object> msg) {
  		String meetingID = Red5.getConnectionLocal().getScope().getName();
  		String requesterID = getBbbSession().getInternalUserID();	
  		Boolean muteAll = (Boolean) msg.get("mute");
  		red5InGW.muteAllExceptPresenter(meetingID, requesterID, muteAll);
	}
	
	public void muteAllUsers(Map<String, Object> msg) {
		String meetingID = Red5.getConnectionLocal().getScope().getName();
		String requesterID = getBbbSession().getInternalUserID();	
		Boolean mute = (Boolean) msg.get("mute");
		red5InGW.muteAllUsers(meetingID, requesterID, mute); 		
	}	
	
	public void isRoomMuted(){
		String meetingID = Red5.getConnectionLocal().getScope().getName();
		String requesterID = getBbbSession().getInternalUserID();		
		red5InGW.isMeetingMuted(meetingID, requesterID); 	
	}

	public void muteUnmuteUser(Map<String, Object> msg) {
		Boolean mute = (Boolean) msg.get(VoiceKeyUtil.MUTE);
		String userid = (String) msg.get(VoiceKeyUtil.USERID);

		String meetingID = Red5.getConnectionLocal().getScope().getName();
		String requesterID = getBbbSession().getInternalUserID();
		red5InGW.muteUser(meetingID, requesterID, userid, mute); 
	}

	public void lockMuteUser(Map<String, Object> msg) { 			
		Boolean lock = (Boolean) msg.get("lock");
		String userid = (String) msg.get("userId");
		
		String meetingID = Red5.getConnectionLocal().getScope().getName();
		String requesterID = getBbbSession().getInternalUserID();		
		red5InGW.lockMuteUser(meetingID, requesterID, userid, lock); 
	}
	
	public void ejectUserFromVoice(Map<String, Object> msg) {
		String userId = (String) msg.get("userId");
		String meetingID = Red5.getConnectionLocal().getScope().getName();
		String ejectedBy = getBbbSession().getInternalUserID();		
		red5InGW.ejectUserFromVoice(meetingID, userId, ejectedBy); 	
	}
	
	private BigBlueButtonSession getBbbSession() {
		return (BigBlueButtonSession) Red5.getConnectionLocal().getAttribute(Constants.SESSION);
	}
	
	public void setRed5Publisher(MessagePublisher red5InGW) {
		this.red5InGW = red5InGW;
	}
}
