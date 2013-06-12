package org.bigbluebutton.conference.service.presentation.messaging.messages;

import java.util.Map;

import org.bigbluebutton.conference.meeting.messaging.OutMessage;

public class ConversionUpdateMessage extends OutMessage {
	private final Map<String, Object> message;
	
	public ConversionUpdateMessage(String meetingID, Boolean recorded, Map<String, Object> message) {
		super(meetingID, recorded);
		this.message = message;
	}
	
	public Map<String, Object> getMessage() {
		return message;
	}

}
