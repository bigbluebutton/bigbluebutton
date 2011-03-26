package org.bigbluebutton.deskshare.server.recorder;

import org.bigbluebutton.deskshare.server.recorder.event.RecordStatusEvent;

public interface RecordStatusListener {
	void notify(RecordStatusEvent event);
}
