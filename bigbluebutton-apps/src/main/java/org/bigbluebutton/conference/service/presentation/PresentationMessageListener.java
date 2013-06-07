package org.bigbluebutton.conference.service.presentation;

import java.util.HashMap;
import java.util.List;

import org.bigbluebutton.conference.service.messaging.redis.MessageHandler;

public class PresentationMessageListener implements MessageHandler {

	private ConversionUpdatesMessageListener listener;
	
	@Override
	public void endMeetingRequest(String meetingId) {
		// do nothing
	}
	
	@Override
	public void presentationUpdates(HashMap<String, String> map) {
		listener.handleReceivedMessage(map);
	}

	@Override
	public void storePoll(String meetingId, String title, String question, List<String> answers){
		// do nothing
	}
	
	public void setPresentationListener(ConversionUpdatesMessageListener listener) {
		this.listener = listener;
	}
}
