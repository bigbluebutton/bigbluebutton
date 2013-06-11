package org.bigbluebutton.conference.meeting.messaging.messages;

import org.bigbluebutton.conference.meeting.messaging.OutMessage;

public class MeetingStartedMessage extends OutMessage {

	public MeetingStartedMessage(String meetingID, Boolean recorded) {
		super(meetingID, recorded);
	}
}
