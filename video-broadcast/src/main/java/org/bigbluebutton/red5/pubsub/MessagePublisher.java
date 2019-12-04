package org.bigbluebutton.red5.pubsub;

//import org.bigbluebutton.common.messages.*; //TODO try with just the 2 messages

public class MessagePublisher {

	private MessageSender sender;

	public void setMessageSender(MessageSender sender) {
		this.sender = sender;
	}

	public void userSharedWebcamMessage(String meetingId, String userId, String streamId) {
		//UserSharedWebcamMessage msg = new UserSharedWebcamMessage(meetingId, userId, streamId);
		//sender.send(MessagingConstants.TO_USERS_CHANNEL, msg.toJson()); //TODO change the channel
	}

	public void userUnshareWebcamRequestMessage(String meetingId, String userId, String streamId) {
		//UserUnshareWebcamRequestMessage msg = new UserUnshareWebcamRequestMessage(meetingId, userId, streamId);
		//sender.send(MessagingConstants.TO_USERS_CHANNEL, msg.toJson()); //TODO what do we do with these
	}



}
