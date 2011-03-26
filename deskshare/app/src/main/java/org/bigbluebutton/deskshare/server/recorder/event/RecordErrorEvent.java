package org.bigbluebutton.deskshare.server.recorder.event;

public class RecordErrorEvent extends RecordStatusEvent {

	private final String session;
	private String reason;
	
	public RecordErrorEvent(String session) {
		this.session = session;
	}
	
	public void setReason(String reason) {
		this.reason = reason;
	}
	
	public String getSession() {
		return session;
	}
	
	public String getReason() {
		return reason;
	}
	
}
