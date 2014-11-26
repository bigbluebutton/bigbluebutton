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
package org.bigbluebutton.conference.service.chat;

import java.util.HashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.bigbluebutton.conference.BigBlueButtonSession;
import org.bigbluebutton.conference.Constants;
import org.red5.logging.Red5LoggerFactory;import org.red5.server.api.Red5;

public class ChatService {	
	private static Logger log = Red5LoggerFactory.getLogger( ChatService.class, "bigbluebutton" );
	
	private ChatApplication application;

	public void sendPublicChatHistory() {
		String meetingID = Red5.getConnectionLocal().getScope().getName();
		String requesterID = getBbbSession().getInternalUserID();
		
		application.sendPublicChatHistory(meetingID, requesterID);
	}
	
	private BigBlueButtonSession getBbbSession() {
		return (BigBlueButtonSession) Red5.getConnectionLocal().getAttribute(Constants.SESSION);
	}
	
	public void sendPublicMessage(Map<String, Object> msg) {
		
		String chatType = msg.get(ChatKeyUtil.CHAT_TYPE).toString(); 
		String fromUserID = msg.get(ChatKeyUtil.FROM_USERID).toString();
		String fromUsername = msg.get(ChatKeyUtil.FROM_USERNAME ).toString();
		String fromColor = msg.get(ChatKeyUtil.FROM_COLOR).toString();
		String fromTime = msg.get(ChatKeyUtil.FROM_TIME).toString();   
		String fromTimezoneOffset = msg.get(ChatKeyUtil.FROM_TZ_OFFSET).toString();
		String toUserID = msg.get(ChatKeyUtil.TO_USERID).toString();
		String toUsername = msg.get(ChatKeyUtil.TO_USERNAME).toString();
		String chatText = msg.get(ChatKeyUtil.MESSAGE).toString();
		
		Map<String, String> message = new HashMap<String, String>();
		message.put(ChatKeyUtil.CHAT_TYPE, chatType); 
		message.put(ChatKeyUtil.FROM_USERID, fromUserID);
		message.put(ChatKeyUtil.FROM_USERNAME, fromUsername);
		message.put(ChatKeyUtil.FROM_COLOR, fromColor);
		message.put(ChatKeyUtil.FROM_TIME, fromTime);   
		message.put(ChatKeyUtil.FROM_TZ_OFFSET, fromTimezoneOffset);
		message.put(ChatKeyUtil.TO_USERID, toUserID);
		message.put(ChatKeyUtil.TO_USERNAME, toUsername);
		message.put(ChatKeyUtil.MESSAGE, chatText);
	
		String meetingID = Red5.getConnectionLocal().getScope().getName();
		String requesterID = getBbbSession().getInternalUserID();
		
		application.sendPublicMessage(meetingID, requesterID, message);
	}
	
	public void setChatApplication(ChatApplication a) {
		application = a;
	}

	public void sendPrivateMessage(Map<String, Object> msg){
		String chatType = msg.get(ChatKeyUtil.CHAT_TYPE).toString(); 
		String fromUserID = msg.get(ChatKeyUtil.FROM_USERID).toString();
		String fromUsername = msg.get(ChatKeyUtil.FROM_USERNAME ).toString();
		String fromColor = msg.get(ChatKeyUtil.FROM_COLOR).toString();
		String fromTime = msg.get(ChatKeyUtil.FROM_TIME).toString();   
		String fromTimezoneOffset = msg.get(ChatKeyUtil.FROM_TZ_OFFSET).toString();
		String toUserID = msg.get(ChatKeyUtil.TO_USERID).toString();
		String toUsername = msg.get(ChatKeyUtil.TO_USERNAME).toString();
		String chatText = msg.get(ChatKeyUtil.MESSAGE).toString();
		
		Map<String, String> message = new HashMap<String, String>();
		message.put(ChatKeyUtil.CHAT_TYPE, chatType); 
		message.put(ChatKeyUtil.FROM_USERID, fromUserID);
		message.put(ChatKeyUtil.FROM_USERNAME, fromUsername);
		message.put(ChatKeyUtil.FROM_COLOR, fromColor);
		message.put(ChatKeyUtil.FROM_TIME, fromTime);   
		message.put(ChatKeyUtil.FROM_TZ_OFFSET, fromTimezoneOffset);
		message.put(ChatKeyUtil.TO_USERID, toUserID);
		message.put(ChatKeyUtil.TO_USERNAME, toUsername);
		message.put(ChatKeyUtil.MESSAGE, chatText);
	
		String meetingID = Red5.getConnectionLocal().getScope().getName();
		String requesterID = getBbbSession().getInternalUserID();
		
		application.sendPrivateMessage(meetingID, requesterID, message);

	}
}
