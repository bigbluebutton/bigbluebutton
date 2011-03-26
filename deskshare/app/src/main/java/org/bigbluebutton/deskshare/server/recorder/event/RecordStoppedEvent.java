package org.bigbluebutton.deskshare.server.recorder.event;

public class RecordStoppedEvent extends RecordStatusEvent {
	private final String session;

	public RecordStoppedEvent(String session) {
		this.session = session;
	}
	
	public String getSession() {
		return session;
	}
}
