package org.bigbluebutton.webconference.voice.events;

public class StartRecordingEvent extends ConferenceEvent {

	private String timestamp;
	private String filename;
	private boolean record;
	
	public StartRecordingEvent(Integer participantId, String room, boolean record) {
		super(participantId, room);
		this.record =  record;
	}
	
	public void setTimestamp(String timestamp) {
		this.timestamp = timestamp;
	}

	public void setRecordingFilename(String filename) {
		this.filename = filename;
	}
	
	public String getTimestamp() {
		return timestamp;
	}
	
	public String getRecordingFilename() {
		return filename;
	}
	
	public boolean startRecord() {
		return record;
	}
}
