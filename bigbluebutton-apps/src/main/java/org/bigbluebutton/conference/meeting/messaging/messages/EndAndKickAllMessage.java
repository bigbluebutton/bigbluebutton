package org.bigbluebutton.conference.meeting.messaging.messages;

import org.bigbluebutton.conference.meeting.messaging.OutMessage;

public class EndAndKickAllMessage extends OutMessage {

	public EndAndKickAllMessage(String meetingID, Boolean recorded) {
		super(meetingID, recorded);
	}
}
