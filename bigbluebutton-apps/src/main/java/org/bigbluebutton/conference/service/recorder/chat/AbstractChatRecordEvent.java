package org.bigbluebutton.conference.service.recorder.chat;

import org.bigbluebutton.conference.service.recorder.RecordEvent;

public abstract class AbstractChatRecordEvent extends RecordEvent {

	/**
	 * Hardcodes the module name to "CHAT".
	 * Calling this method will not have any effect.
	 */
	@Override
	public final void setModule(String module) {
		eventMap.put(MODULE, "CHAT");
	}
}
