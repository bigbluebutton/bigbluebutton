package org.bigbluebutton.webconference.voice;

import org.bigbluebutton.conference.service.recorder.RecordEvent;

public abstract class AbstractVoiceRecordEvent extends RecordEvent {
	
	public AbstractVoiceRecordEvent() {
		setModule("VOICE");
	}

	public void setBridge(String bridge) {
		eventMap.put("bridge", bridge);
	}
}
