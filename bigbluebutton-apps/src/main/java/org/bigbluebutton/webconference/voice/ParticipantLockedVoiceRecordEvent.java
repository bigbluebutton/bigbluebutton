package org.bigbluebutton.webconference.voice;

public class ParticipantLockedVoiceRecordEvent extends AbstractVoiceRecordEvent {
	/**
	 * Hardcodes the Event Name to "ParticipantLockedEvent"
	 */
	@Override
	public void setEvent(String event) {
		eventMap.put(EVENT, "ParticipantLockedEvent");
	}
	
	public void setParticipant(String p) {
		eventMap.put("participant", p);
	}
	
	public void setLocked(boolean locked) {
		eventMap.put("locked", Boolean.toString(locked));
	}
}
