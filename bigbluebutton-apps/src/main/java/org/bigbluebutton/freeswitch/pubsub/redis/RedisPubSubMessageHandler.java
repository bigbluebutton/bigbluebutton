package org.bigbluebutton.freeswitch.pubsub.redis;

import org.bigbluebutton.common.messages.MessagingConstants;
import org.bigbluebutton.conference.meeting.messaging.red5.ConnectionInvokerService;
import org.bigbluebutton.red5.client.MeetingClientMessageSender;
import org.bigbluebutton.red5.client.PresentationClientMessageSender;
import org.bigbluebutton.red5.client.UserClientMessageSender;
import org.bigbluebutton.red5.client.ChatClientMessageSender;
import org.bigbluebutton.red5.client.WhiteboardClientMessageSender;

public class RedisPubSubMessageHandler implements MessageHandler {

	private ConnectionInvokerService service;
	private UserClientMessageSender userMessageSender;
	private MeetingClientMessageSender meetingMessageSender;
	private ChatClientMessageSender chatMessageSender;
	private PresentationClientMessageSender presentationMessageSender;

	private WhiteboardClientMessageSender whiteboardMessageSender;
	
	public void setConnectionInvokerService(ConnectionInvokerService s) {
		this.service = s;
		userMessageSender = new UserClientMessageSender(service);
		meetingMessageSender = new MeetingClientMessageSender(service);
		chatMessageSender = new ChatClientMessageSender(service);
		presentationMessageSender = new PresentationClientMessageSender(service);
		whiteboardMessageSender = new WhiteboardClientMessageSender(service);
	}
	
	@Override
	public void handleMessage(String pattern, String channel, String message) {
		if (channel.equalsIgnoreCase(MessagingConstants.FROM_CHAT_CHANNEL)) {
			chatMessageSender.handleChatMessage(message);
		} else if (channel.equalsIgnoreCase(MessagingConstants.FROM_PRESENTATION_CHANNEL)) {
			presentationMessageSender.handlePresentationMessage(message);
		} else if (channel.equalsIgnoreCase(MessagingConstants.FROM_MEETING_CHANNEL)) {
			meetingMessageSender.handleMeetingMessage(message);
		} else if (channel.equalsIgnoreCase(MessagingConstants.FROM_USERS_CHANNEL)) {
			userMessageSender.handleUsersMessage(message);
		} else if (channel.equalsIgnoreCase(MessagingConstants.FROM_WHITEBOARD_CHANNEL)) {
			System.out.println("the message FROM_WHITEBOARD_CHANNEL is:"+message);
			whiteboardMessageSender.handleWhiteboardMessage(message);
		}
	}

}
