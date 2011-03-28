package org.bigbluebutton.deskshare.server.recorder;

import org.bigbluebutton.deskshare.server.recorder.event.RecordEvent;

public interface RecordStatusListener {
	void notify(RecordEvent event);
}
