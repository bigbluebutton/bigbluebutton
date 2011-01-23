package org.bigbluebutton.webconference.voice;

import org.bigbluebutton.conference.service.recorder.RecordEvent;

public abstract class AbstractVoiceRecordEvent extends RecordEvent {
	/**
	 * Hardcodes the module name to "VOICE"
	 * Calling this method will not have any effect.
	 */
	@Override
	public final void setModule(String module) {
		eventMap.put(MODULE, "VOICE");
	}

	public void setBridge(String bridge) {
		eventMap.put("bridge", bridge);
	}
}
