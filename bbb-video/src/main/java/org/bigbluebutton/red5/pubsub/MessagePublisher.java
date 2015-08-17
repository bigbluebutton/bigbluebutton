package org.bigbluebutton.red5.pubsub;

import org.bigbluebutton.common.messages.*;

public class MessagePublisher {

	private MessageSender sender;
	
	public void setMessageSender(MessageSender sender) {
		this.sender = sender;
	}
	
	// Polling 
	public void userSharedWebcamMessage(String meetingId, String userId, String streamId) {
		UserSharedWebcamMessage msg = new UserSharedWebcamMessage(meetingId, userId, streamId);
		sender.send(MessagingConstants.TO_USERS_CHANNEL, msg.toJson());
	}

	public void userUnshareWebcamRequestMessage(String meetingId, String userId, String streamId) {
		UserUnshareWebcamRequestMessage msg = new UserUnshareWebcamRequestMessage(meetingId, userId, streamId);
		sender.send(MessagingConstants.TO_USERS_CHANNEL, msg.toJson());
	}
	
}
