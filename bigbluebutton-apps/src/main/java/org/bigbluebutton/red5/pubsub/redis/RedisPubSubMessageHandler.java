package org.bigbluebutton.red5.pubsub.redis;

import org.bigbluebutton.common.messages.MessagingConstants;
import org.bigbluebutton.red5.client.MeetingClientMessageSender;
import org.bigbluebutton.red5.client.PollingClientMessageSender;
import org.bigbluebutton.red5.client.PresentationClientMessageSender;
import org.bigbluebutton.red5.client.UserClientMessageSender;
import org.bigbluebutton.red5.client.ChatClientMessageSender;
import org.bigbluebutton.red5.client.WhiteboardClientMessageSender;
import org.bigbluebutton.red5.client.CaptionClientMessageSender;
import org.bigbluebutton.red5.client.DeskShareMessageSender;
import org.bigbluebutton.red5.client.messaging.ConnectionInvokerService;
import org.bigbluebutton.red5.monitoring.BbbAppsIsKeepAliveHandler;
import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;

public class RedisPubSubMessageHandler implements MessageHandler {
  private static Logger log = Red5LoggerFactory.getLogger(RedisPubSubMessageHandler.class, "bigbluebutton");

	private ConnectionInvokerService service;
	private UserClientMessageSender userMessageSender;
	private MeetingClientMessageSender meetingMessageSender;
	private ChatClientMessageSender chatMessageSender;
	private PresentationClientMessageSender presentationMessageSender;
	private WhiteboardClientMessageSender whiteboardMessageSender;
	private DeskShareMessageSender deskShareMessageSender;
	private BbbAppsIsKeepAliveHandler bbbAppsIsKeepAliveHandler;
	private PollingClientMessageSender pollingMessageSender;
	private CaptionClientMessageSender captionMessageSender;
	
	public void setConnectionInvokerService(ConnectionInvokerService s) {
		this.service = s;
		userMessageSender = new UserClientMessageSender(service);
		meetingMessageSender = new MeetingClientMessageSender(service);
		chatMessageSender = new ChatClientMessageSender(service);
		presentationMessageSender = new PresentationClientMessageSender(service);
		whiteboardMessageSender = new WhiteboardClientMessageSender(service);
		deskShareMessageSender = new DeskShareMessageSender(service);
		pollingMessageSender = new PollingClientMessageSender(service);
		captionMessageSender = new CaptionClientMessageSender(service);
	}
	
	public void setBbbAppsIsKeepAliveHandler(BbbAppsIsKeepAliveHandler handler) {
		bbbAppsIsKeepAliveHandler = handler;
	}
	
	@Override
	public void handleMessage(String pattern, String channel, String message) {
//		System.out.println("in red5 getting message: " + channel + " " + message);
		if (channel.equalsIgnoreCase(MessagingConstants.FROM_CHAT_CHANNEL)) {
			chatMessageSender.handleChatMessage(message);
		} else if (channel.equalsIgnoreCase(MessagingConstants.FROM_PRESENTATION_CHANNEL)) {
			presentationMessageSender.handlePresentationMessage(message);
		} else if (channel.equalsIgnoreCase(MessagingConstants.FROM_MEETING_CHANNEL)) {
			meetingMessageSender.handleMeetingMessage(message);
		} else if (channel.equalsIgnoreCase(MessagingConstants.FROM_USERS_CHANNEL)) {
			userMessageSender.handleUsersMessage(message);
		} else if (channel.equalsIgnoreCase(MessagingConstants.FROM_WHITEBOARD_CHANNEL)) {
			whiteboardMessageSender.handleWhiteboardMessage(message);
		} else if (channel.equalsIgnoreCase(MessagingConstants.FROM_SYSTEM_CHANNEL)) {
			bbbAppsIsKeepAliveHandler.handleKeepAliveMessage(message);
		} else if (channel.equalsIgnoreCase(MessagingConstants.FROM_DESK_SHARE_CHANNEL)) {
			deskShareMessageSender.handleDeskShareMessage(message);
		} else if (channel.equalsIgnoreCase(MessagingConstants.FROM_POLLING_CHANNEL)) {
			pollingMessageSender.handlePollMessage(message);
		} else if (channel.equalsIgnoreCase(MessagingConstants.FROM_CAPTION_CHANNEL)) {
			captionMessageSender.handleCaptionMessage(message);
		}
	}

}
