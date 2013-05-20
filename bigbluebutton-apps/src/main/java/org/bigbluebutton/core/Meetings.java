package org.bigbluebutton.core;

import java.util.concurrent.ConcurrentHashMap;

import org.bigbluebutton.core.messages.CreateMeeting;
import org.bigbluebutton.core.messages.Message;

public class Meetings {

	private ConcurrentHashMap<String, Meeting> meetings;
	
	public Meetings() {
		meetings = new ConcurrentHashMap<String, Meeting>();
	}
	
	public void processMessage(Message message) {
		if (message instanceof CreateMeeting) {
			processCreateMeetingMessage((CreateMeeting) message);
		}
	}
	
	private void processCreateMeetingMessage(CreateMeeting message) {
		if (meetings.containsKey(message.getMeetingID())) {
			Meeting m = new Meeting(message.getMeetingID());
			meetings.put(m.getMeetingID(), m);
		}
	}
}
