package org.bigbluebutton.conference.service.recorder.chat;

import org.bigbluebutton.conference.service.recorder.RecordEvent;

public abstract class AbstractChatRecordEvent extends RecordEvent {

	public AbstractChatRecordEvent() {
		setModule("CHAT");
	}
}
