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

import java.util.HashMap;
import java.util.Map;

import org.bigbluebutton.red5.BigBlueButtonSession;
import org.bigbluebutton.red5.Constants;
import org.bigbluebutton.red5.pubsub.MessagePublisher;
import org.red5.logging.Red5LoggerFactory;
import org.red5.server.api.Red5;
import org.slf4j.Logger;

public class ChatService {	
	private static Logger log = Red5LoggerFactory.getLogger( ChatService.class, "bigbluebutton" );
	
	private MessagePublisher red5BBBInGw;
	private int maxMessageLength;

	public void sendPublicChatHistory() {
		String meetingID = Red5.getConnectionLocal().getScope().getName();
		String requesterID = getBbbSession().getInternalUserID();
		// Just hardcode as we don't really need it for flash client. (ralam may 7, 2014)
		String replyTo = meetingID + "/" + requesterID; 
		
		red5BBBInGw.getChatHistory(meetingID, requesterID, replyTo);
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

		// The message is being ignored in the red5 application to avoid copying it to any another application which that may cause a memory issue
		if (chatText.length() <= maxMessageLength) {
			red5BBBInGw.sendPublicMessage(meetingID, requesterID, message);
		}
		else {
			log.warn("sendPublicMessage maximum allowed message length exceeded (length: [" + chatText.length() + "], message: [" + chatText + "])");
		}
	}
	
	public void setRed5Publisher(MessagePublisher inGW) {
		red5BBBInGw = inGW;
	}
	
	public void setMaxMessageLength(int maxLength) {
		maxMessageLength = maxLength;
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

		// The message is being ignored in the red5 application to avoid copying it to any another application which that may cause a memory issue
		if (chatText.length() <= maxMessageLength) {
			red5BBBInGw.sendPrivateMessage(meetingID, requesterID, message);
		}
		else {
			log.warn("sendPrivateMessage maximum allowed message length exceeded (length: [" + chatText.length() + "], message: [" + chatText + "])");
		}
	}
}
