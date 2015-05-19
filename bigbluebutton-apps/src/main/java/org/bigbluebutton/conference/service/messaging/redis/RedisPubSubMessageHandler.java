package org.bigbluebutton.conference.service.messaging.redis;

import org.bigbluebutton.conference.meeting.messaging.red5.ConnectionInvokerService;
import org.bigbluebutton.conference.service.messaging.MessagingConstants;

public class RedisPubSubMessageHandler implements MessageHandler {

	private ConnectionInvokerService service;
	
	public void setConnectionInvokerService(ConnectionInvokerService s) {
		this.service = s;
	}
	
	@Override
	public void handleMessage(String pattern, String channel, String message) {
		if (channel.equalsIgnoreCase(MessagingConstants.FROM_CHAT_CHANNEL)) {
			handleChatMessage(message);
		} else if (channel.equalsIgnoreCase(MessagingConstants.FROM_PRESENTATION_CHANNEL)) {
			handlePresentationMessage(message);
		} else if (channel.equalsIgnoreCase(MessagingConstants.FROM_MEETING_CHANNEL)) {
			handleMeetingMessage(message);
		} else if (channel.equalsIgnoreCase(MessagingConstants.FROM_USERS_CHANNEL)) {
			handleUsersMessage(message);
		} else if (channel.equalsIgnoreCase(MessagingConstants.FROM_WHITEBOARD_CHANNEL)) {
			handleWhiteboarMessage(message);
		} 
	}
	
	private void handleChatMessage(String message) {
		
	}

	private void handlePresentationMessage(String message) {
		
	}
	
	private void handleMeetingMessage(String message) {
		
	}
	
	private void handleUsersMessage(String message) {
		
	}
	
	private void handleWhiteboarMessage(String message) {
		
	}
}
