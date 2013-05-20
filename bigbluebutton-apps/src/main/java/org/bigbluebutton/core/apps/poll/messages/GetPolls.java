package org.bigbluebutton.core.apps.poll.messages;

import org.bigbluebutton.core.messages.AbstractMessage;

public class GetPolls extends AbstractMessage {
	private final String requestBy;
	
	public GetPolls(String meetingID, String requestBy) {
		super(meetingID);
		this.requestBy = requestBy;
	}
	
	public String getRequestBy() {
		return requestBy;
	}
}
