package org.bigbluebutton.conference.service.messaging;

import java.util.HashMap;

public interface MessageListener {
	void endMeetingRequest(String meetingId);
	void presentationUpdates(HashMap<String,String> map);
}
