package org.bigbluebutton.deskshare.server.recorder.event;

public class RecordStoppedEvent extends AbstractDeskshareRecordEvent {

	public RecordStoppedEvent(String session) {
		super(session);
		setEvent("DeskshareStoppedEvent");
	}

	public void setFile(String path) {
		eventMap.put("file", path);
	}
}
