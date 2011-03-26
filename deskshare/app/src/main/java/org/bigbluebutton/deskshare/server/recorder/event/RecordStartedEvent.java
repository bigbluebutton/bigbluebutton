package org.bigbluebutton.deskshare.server.recorder.event;

public class RecordStartedEvent extends RecordStatusEvent {
	private final String session;

	public RecordStartedEvent(String session) {
		this.session = session;
	}
	
	public String getSession() {
		return session;
	}
}
