package org.bigbluebutton.deskshare.server.recorder.event;

public class RecordStoppedEvent extends AbstractDeskshareRecordEvent {

	public RecordStoppedEvent(String session) {
		super(session);
	}

	public void setFile(String path) {
		eventMap.put("file", path);
	}
}
