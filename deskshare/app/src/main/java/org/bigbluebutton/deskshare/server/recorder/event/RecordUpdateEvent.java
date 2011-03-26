package org.bigbluebutton.deskshare.server.recorder.event;

public class RecordUpdateEvent extends RecordStatusEvent {
	private final String session;

	public RecordUpdateEvent(String session) {
		this.session = session;
	}
	
	public String getSession() {
		return session;
	}
}
