package org.bigbluebutton.red5.pubsub;

import org.bigbluebutton.common.messages.*;
import org.bigbluebutton.client.IClientInGW;

public class MessagePublisher {

	private IClientInGW sender;
	
	public void setMessageSender(IClientInGW sender) {
		this.sender = sender;
	}

	public void setRecordingStatus(String meetingId, String userId, Boolean recording) {
		SetRecordingStatusRequestMessage msg = new SetRecordingStatusRequestMessage(meetingId, userId, recording);
		sender.send(MessagingConstants.TO_USERS_CHANNEL, msg.toJson());
	}

	public void getRecordingStatus(String meetingId, String userId) {
		GetRecordingStatusRequestMessage msg = new GetRecordingStatusRequestMessage(meetingId, userId);
		sender.send(MessagingConstants.TO_USERS_CHANNEL, msg.toJson());		
	}

	public void activityResponse(String meetingID) {
		ActivityResponseMessage msg = new ActivityResponseMessage(meetingID);
		sender.send(MessagingConstants.TO_MEETING_CHANNEL, msg.toJson());
	}
}
