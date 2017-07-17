package org.bigbluebutton.red5.pubsub.redis;

import org.bigbluebutton.common.messages.MessagingConstants;
import org.bigbluebutton.red5.client.MeetingClientMessageSender;
import org.bigbluebutton.red5.client.UserClientMessageSender;
import org.bigbluebutton.red5.client.messaging.IConnectionInvokerService;
import org.bigbluebutton.red5.monitoring.BbbAppsIsKeepAliveHandler;
import org.slf4j.Logger;

public class RedisPubSubMessageHandler implements MessageHandler {

	private IConnectionInvokerService service;
	private UserClientMessageSender userMessageSender;
	private MeetingClientMessageSender meetingMessageSender;
	//private BbbAppsIsKeepAliveHandler bbbAppsIsKeepAliveHandler;
	
	public void setConnectionInvokerService(IConnectionInvokerService s) {
		this.service = s;
		userMessageSender = new UserClientMessageSender(service);
		meetingMessageSender = new MeetingClientMessageSender(service);
	}
	
	public void setBbbAppsIsKeepAliveHandler(BbbAppsIsKeepAliveHandler handler) {
		//bbbAppsIsKeepAliveHandler = handler;
	}
	
	@Override
	public void handleMessage(String pattern, String channel, String message) {
//		System.out.println("in red5 getting message: " + channel + " " + message);
		if (channel.equalsIgnoreCase(MessagingConstants.FROM_MEETING_CHANNEL)) {
			meetingMessageSender.handleMeetingMessage(message);
		} else if (channel.equalsIgnoreCase(MessagingConstants.FROM_USERS_CHANNEL)) {
			userMessageSender.handleUsersMessage(message);
		} else if (channel.equalsIgnoreCase(MessagingConstants.FROM_SYSTEM_CHANNEL)) {
			//bbbAppsIsKeepAliveHandler.handleKeepAliveMessage(message);
		}
	}

}
