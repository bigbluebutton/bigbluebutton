package org.bigbluebutton.conference.meeting.messaging.messages;

import org.bigbluebutton.conference.meeting.messaging.OutMessage;

public class MeetingEndedMessage extends OutMessage {

	public MeetingEndedMessage(String meetingID, Boolean recorded) {
		super(meetingID, recorded);
	}
}
