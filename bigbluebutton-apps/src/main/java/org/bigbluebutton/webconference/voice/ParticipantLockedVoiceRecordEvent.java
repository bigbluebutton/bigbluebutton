package org.bigbluebutton.webconference.voice;

public class ParticipantLockedVoiceRecordEvent extends AbstractVoiceRecordEvent {
	
	public ParticipantLockedVoiceRecordEvent() {
		super();
		setEvent("ParticipantLockedEvent");
	}
		
	public void setParticipant(String p) {
		eventMap.put("participant", p);
	}
	
	public void setLocked(boolean locked) {
		eventMap.put("locked", Boolean.toString(locked));
	}
}
