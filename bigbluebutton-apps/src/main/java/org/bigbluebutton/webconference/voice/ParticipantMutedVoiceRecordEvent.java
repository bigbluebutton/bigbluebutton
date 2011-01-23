package org.bigbluebutton.webconference.voice;

public class ParticipantMutedVoiceRecordEvent extends AbstractVoiceRecordEvent {
	/**
	 * Hardcodes the Event Name to "ParticipantMutedEvent"
	 */
	@Override
	public void setEvent(String event) {
		eventMap.put(EVENT, "ParticipantMutedEvent");
	}
	
	public void setParticipant(String p) {
		eventMap.put("participant", p);
	}
	
	public void setMuted(boolean muted) {
		eventMap.put("muted", Boolean.toString(muted));
	}
}
