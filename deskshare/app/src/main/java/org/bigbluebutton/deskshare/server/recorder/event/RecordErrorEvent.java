package org.bigbluebutton.deskshare.server.recorder.event;

public class RecordErrorEvent extends AbstractDeskshareRecordEvent {

	private String reason;
	
	public RecordErrorEvent(String session) {
		super(session);
	}
	
	public void setReason(String reason) {
		this.reason = reason;
	}
	
	public String getReason() {
		return reason;
	}
	
}
