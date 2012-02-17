package org.bigbluebutton.deskshare.server.recorder.event;

public class RecordStartedEvent extends AbstractDeskshareRecordEvent {

	public RecordStartedEvent(String session) {
		super(session);
		setEvent("DeskshareStartedEvent");
	}
	
	public void setFile(String path) {
		eventMap.put("file", path);
	}
}
