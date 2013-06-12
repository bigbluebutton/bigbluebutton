package org.bigbluebutton.conference.service.presentation.messaging.messages;

import java.util.Map;

import org.bigbluebutton.conference.meeting.messaging.OutMessage;

public class GetPresentationInforReplyMessage extends OutMessage {
	private final String requesterID;
	private final Map<String, Object> info;
	
	public GetPresentationInforReplyMessage(String meetingID, Boolean recorded, String requesterID, Map<String, Object> info) {
		super(meetingID, recorded);
		this.requesterID = requesterID;
		this.info = info;
	}

	public String getRequesterID() {
		return requesterID;
	}

	public Map<String, Object> getInfo() {
		return info;
	}
	
	

}
