package org.bigbluebutton.webconference.voice;

public class ParticipantMutedVoiceRecordEvent extends AbstractVoiceRecordEvent {
	
	public ParticipantMutedVoiceRecordEvent() {
		super();
		setEvent("ParticipantMutedEvent");
	}
		
	public void setParticipant(String p) {
		eventMap.put("participant", p);
	}
	
	public void setMuted(boolean muted) {
		eventMap.put("muted", Boolean.toString(muted));
	}
}
