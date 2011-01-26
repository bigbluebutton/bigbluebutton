package org.bigbluebutton.webconference.voice;

public class StartRecordingVoiceRecordEvent extends AbstractVoiceRecordEvent {
	
	public StartRecordingVoiceRecordEvent(boolean record) {
		super();
		if (record)
			setEvent("StartRecordingEvent");
		else
			setEvent("StopRecordingEvent");
	}
	
	public void setRecordingTimestamp(String timestamp) {
		eventMap.put("recordingTimestamp", timestamp);
	}
		
	public void setFilename(String filename) {
		eventMap.put("filename", filename);
	}
}
