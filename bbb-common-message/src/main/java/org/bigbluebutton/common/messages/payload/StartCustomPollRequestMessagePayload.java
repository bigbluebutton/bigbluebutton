package org.bigbluebutton.common.messages.payload;

import java.util.ArrayList;

public class StartCustomPollRequestMessagePayload {
	public String pollType;
	public ArrayList<String> answers;
	public String pollId;
	public String requesterId;
	public String meetingId;
}
