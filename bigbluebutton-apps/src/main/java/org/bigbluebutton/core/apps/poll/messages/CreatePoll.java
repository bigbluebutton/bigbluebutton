package org.bigbluebutton.core.apps.poll.messages;

import org.bigbluebutton.core.messages.AbstractMessage;

public class CreatePoll extends AbstractMessage {

	public CreatePoll(String meetingID) {
		super(meetingID);
	}
}
