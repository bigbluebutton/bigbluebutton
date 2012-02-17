package org.bigbluebutton.deskshare.server.recorder.event;

public class AbstractDeskshareRecordEvent extends RecordEvent {

	private String session;
	
	public AbstractDeskshareRecordEvent(String session) {
		setModule("Deskshare");
		this.session = session;
	}
	
	public String getSession() {
		return session;
	}
}
